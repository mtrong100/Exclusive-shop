import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/components/auth-context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { COUPON_CODE } from "@/constanst";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";
import { displayPrice } from "@/utils/helper";
import Checkbox from "@/components/Checkbox";
import { createOrderApi } from "@/services/orderService";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import StripeCheckout from "react-stripe-checkout";

// ZOD VALIDATION
const formSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Invalid phone number format" }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters long" })
    .max(100, { message: "Address cannot exceed 100 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [totalPurchase, setTotalPurchase] = useState<number | null>(null);
  const [checkPayment, setCheckPayment] = useState<boolean>(false);
  const { cart, calculateSubTotal, calculatePurchase, clearCart } = useCart();
  const [loadingPayment, setLoadingPayment] = useState<boolean>(false);
  const [loadingStripe, setLoadingStripe] = useState<boolean>(false);

  // REACT-HOOK-FORM
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      email: "",
    },
  });

  // PURCHASE BILL
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!checkPayment) {
      toast.info("Please check payment method");
      return;
    }

    Swal.fire({
      title: "Ready to purchase?",
      text: "Let's gooo, Give me that!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Purchase",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoadingPayment(true);
          const token = JSON.parse(
            localStorage.getItem("EXCLUSIVE_TOKEN") || ""
          );
          const total = calculatePurchase();

          const request = {
            shippingAddress: {
              ...values,
            },
            orderItems: cart,
            paymentMethod: "Cash on delivery",
            total,
            user: currentUser?._id,
          };

          await createOrderApi(token, request);
          setLoadingPayment(false);
          Swal.fire(
            "Place order successfully!",
            "Check your email to see order detail",
            "success"
          );
          clearCart();
          navigate("/order");
        } catch (error) {
          console.log("Failed to fetch API ->", error);
          toast.error("Failed to place an order");
          setLoadingPayment(false);
        }
      }
    });
  }

  // PURCHASE WITH CARD
  const stripePayment = async () => {
    const values = form.getValues();

    if (!(values.fullName && values.phone && values.email && values.address)) {
      toast.error("You forgot to fill in the form");
      return;
    }

    try {
      setLoadingStripe(true);
      const token = JSON.parse(localStorage.getItem("EXCLUSIVE_TOKEN") || "");
      const total = calculatePurchase();

      const request = {
        shippingAddress: {
          ...values,
        },
        orderItems: cart,
        paymentMethod: "Pay with card",
        total,
        user: currentUser?._id,
      };

      await createOrderApi(token, request);
      clearCart();
      setLoadingStripe(false);
    } catch (error) {
      toast.error("Failed to payment with card");
      console.log("Failed to payment with card", error);
      setLoadingStripe(false);
    }
  };

  // APPLY COUPON CODE
  const handleApplyCouponCode = () => {
    if (!couponCode) {
      toast.info("Please fill in coupon code");
      return;
    }

    if (couponCode !== COUPON_CODE) {
      toast.error("Wrong coupon code");
      return;
    }

    if (couponApplied) {
      toast.error("Coupon code has already been applied.");
      return;
    }

    const total = calculatePurchase(couponCode);
    setTotalPurchase(total);
    setCouponApplied(true);
  };

  // FIX SCROLL BUG
  useEffect(() => {
    document.body.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section className="mt-[80px] mb-[140px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 items-start gap-[100px]">
            {/* FIELDS */}
            <section>
              <h1 className="mb-5 font-semibold text-3xl">Billing Details</h1>
              <ul className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="h-[50px] border-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          className="h-[50px] border-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your address"
                          {...field}
                          className="h-[50px] border-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          {...field}
                          className="h-[50px] border-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ul>
            </section>

            {/* BILLING DETAILS */}
            <section>
              {/* PRODUCTS IN CART */}
              <ul className="flex flex-col gap-3">
                {cart?.map((item) => (
                  <li
                    key={item?.product}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <img
                        src={item?.image}
                        alt={item?.name}
                        className="w-[54px] h-[54px] object-contain flex-shrink-0"
                      />
                      <h1 className="capitalize text-sm max-w-[300px] truncate">
                        {item?.name}
                      </h1>
                    </div>

                    <p>{displayPrice(item?.price)}</p>
                  </li>
                ))}
              </ul>

              {/* BILL PAYMENT */}
              <ul className="mt-[24px] flex flex-col gap-4">
                <li className="flex items-center justify-between border-b border-black pb-2">
                  <p>Subtotal:</p>
                  <p>{displayPrice(calculateSubTotal())}</p>
                </li>
                <li className="flex items-center justify-between border-b border-black pb-2">
                  <p>Shipping:</p>
                  <p>$10</p>
                </li>
                <li className="flex items-center justify-between ">
                  <p>Total:</p>
                  <p>
                    {totalPurchase !== null
                      ? displayPrice(totalPurchase)
                      : displayPrice(calculatePurchase())}
                  </p>
                </li>
              </ul>

              {/* PAYMENT METHOD */}
              <div
                className="flex mt-2 items-center gap-2 cursor-default select-none"
                onClick={() => setCheckPayment(!checkPayment)}
              >
                {checkPayment ? <Checkbox type="checked" /> : <Checkbox />}
                Cash on delivery
              </div>

              {/* APPLY COUPON CODE */}
              <div className="flex items-center gap-4 mt-5">
                <Input
                  type="text"
                  value={couponCode}
                  className="h-[50px] border-gray-500"
                  placeholder="Coupon Code"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCouponCode(e.target.value)
                  }
                />
                <Button
                  type="button"
                  onClick={handleApplyCouponCode}
                  className="h-[50px] px-10"
                >
                  Apply Coupon
                </Button>
              </div>

              <div className="mt-[32px] space-y-3">
                {loadingStripe ? (
                  <Button
                    disabled
                    className="h-[50px] w-full font-bold cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(rgb(40, 160, 229), rgb(1, 94, 148))",
                    }}
                  >
                    {loadingStripe && (
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    )}
                    Pay with card
                  </Button>
                ) : (
                  <StripeCheckout
                    token={stripePayment}
                    stripeKey="pk_test_51OmAzrG1T7kyPILea5z6uMUN5VoCKA4yOluRVCMezmlcHYQnMIs7djqN1mmiWbDoFmyt4sCVqlN69H6MekMafLr900ocV4xdiu"
                    name="Exclusive-shop"
                    email={currentUser?.email}
                    amount={calculatePurchase() * 100}
                    description="Payment with Stripe"
                  ></StripeCheckout>
                )}

                {/* SUBMIT BUYING PRODUCTS */}
                <Button
                  disabled={loadingPayment}
                  type="submit"
                  className="h-[50px] w-full font-bold"
                >
                  {loadingPayment && (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  )}
                  Place an order
                </Button>
              </div>
            </section>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default Checkout;

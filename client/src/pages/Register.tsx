import authBanner from "../assets/images/auth-banner.png";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
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

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

const Register = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <section className="mt-[60px] mb-[140px]">
      <div className="grid grid-cols-2 gap-10 items-center">
        <div className="rounded-md">
          <img src={authBanner} alt="authBanner" className="img-cover" />
        </div>

        {/* FORM CONTENT */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-md mx-auto"
          >
            <h1 className="text-3xl font-medium">Create an account</h1>
            <p className="mt-2">Enter your details below</p>

            <div className="flex flex-col gap-3 mt-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email..."
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password..."
                        {...field}
                        className="h-[50px] border-gray-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="h-[50px] px-10 w-full mt-5">
              Create Account
            </Button>

            <div className="flex items-center justify-center gap-3 hover:bg-primary/5 hover:text-primary hover:border-primary cursor-pointer transition-all  mt-4 w-full border h-[50px]">
              <FcGoogle size={20} />
              <p>Sign up with Google</p>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <p>Already have account?</p>
              <Link
                to="/login"
                className="font-medium hover:text-primary border-b border-black"
              >
                Log in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default Register;

import { LoginForm } from "@/components/form/login-form";
import { Warehouse } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-sm">
              <Warehouse className="size-10" />
            </div>
            Gang Nikmat Inventory
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="https://i.gojekapi.com/darkroom/gofood-indonesia/v2/images/uploads/ff5afa02-fcdb-48a3-88f1-3c48bc2cac70_restaurant-image_1661310150280.jpg"
          alt="Image"
          fill
          className="object-cover"
        />
      </div>
    </main>
  );
}

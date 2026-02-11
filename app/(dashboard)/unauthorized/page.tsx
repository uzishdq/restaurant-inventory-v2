import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constant";

export default function UnauthorizedPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Akses Ditolak</CardTitle>
          <CardDescription>
            Kamu tidak memiliki izin untuk mengakses halaman ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href={ROUTES.AUTH.DASHBOARD}>Kembali ke Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={ROUTES.PUBLIC.LOGIN}>Login dengan akun lain</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

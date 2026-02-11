import { notFound } from "next/navigation";

export default function MainCatchAll() {
  notFound(); // akan render app/dashboard/not-found.tsx
}

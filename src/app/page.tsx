import { DataStructures } from "@/components/data-structures";
import { Toaster } from "@/components/ui/sonner";


export default function Home() {
  return (<>
  <Toaster richColors position="top-right" closeButton/>
    <DataStructures />
  </>);
}

import { useTheme } from "@/components/theme-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, PanelLeft } from "lucide-react";

function Header() {
  const { theme } = useTheme();
  return (
    <div className="h-10 w-full flex items-center justify-start gap-2 mb-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <div
              href="#"
              className="flex items-center gap-4 px-2.5 text-foreground hover:text-foreground"
            >
              <div
                href="#"
                className={`group flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-transparent text-lg font-semibold  md:h-8 md:w-8 md:text-base ${"justify-center"}`}
              >
                {theme == "dark" ? (
                  <img
                    src={"./labs_for_dark.png"}
                    alt="Miracle labs logo"
                    className="transition-all h-8 group-hover:animate-spin aspect-square"
                  />
                ) : (
                  <img
                    src={"./labs_symbol.png"}
                    alt="Miracle labs logo"
                    className="transition-all h-8 group-hover:animate-spin aspect-square"
                  />
                )}
                <span className={" text-nowrap"}>Miracle Labs</span>
              </div>
            </div>
            <div
              href="#"
              className="flex items-center gap-4 px-2.5 text-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb>
        <BreadcrumbList className="hidden sm:flex">
          <BreadcrumbItem>
            <BreadcrumbLink href="/">App</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export default Header;

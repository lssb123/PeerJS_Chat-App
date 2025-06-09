import { useTheme } from "@/components/theme-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeftFromLine, Home, Settings, SquarePlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars

/**
 * Function to create an aside component which will expand or collapse based on the value of `params.expanded`.
 *
 * @param {Object} params - An object containing parameters.
 * @param {boolean} params.expanded - A boolean indicating whether the aside component is expanded.
 * @param {function} params.setExpanded - A function to set the expanded state of the aside component.
 * @returns {ReactElement} Returns a React element representing the aside component.
 * * @example
 * //Render a button with the text "Click Me"
 * <Aside expanded={true} setExpanded={()=>{}} />
 *
 */
function Aside({ expanded, setExpanded }) {
  const [currentLink, setCurrentLink] = useState("dashboard");
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-10 hidden transition-all duration-300 sm:flex flex-col border-r bg-background  ${
        expanded ? "w-[9.5rem]" : "w-14"
      }`}
    >
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <div
          href="#"
          className={`group flex h-9 w-full shrink-0 items-center  justify-center gap-2 rounded-full bg-transparent text-lg font-semibold  md:h-8 md:w-8 md:text-base ${
            expanded ? "justify-start" : "justify-center"
          }`}
        >
          {theme == "dark" ? (
            <img
              src={"./labs_for_dark.png"}
              alt="Miracle labs logo"
              className="transition-all h-8 group-hover:rotate-12 aspect-square"
            />
          ) : (
            <img
              src={"./labs_symbol.png"}
              alt="Miracle labs logo"
              className="transition-all h-8 group-hover:rotate-12 aspect-square"
            />
          )}
          <span className={expanded ? " text-nowrap" : "sr-only "}>
            Miracle Labs
          </span>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                href="#"
                onClick={() => {
                  setCurrentLink("dashboard");
                  navigate("/");
                }}
                className={`flex h-9 w-full  items-center  ${
                  expanded ? " justify-start " : " justify-center "
                } ${
                  currentLink == "dashboard"
                    ? " text-foreground"
                    : "text-muted-foreground"
                } rounded-lg  cursor-pointer transition-colors hover:text-foreground md:h-8 gap-2`}
              >
                {expanded ? (
                  <div className="flex w-full items-center justify-start gap-2 leading-none">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </div>
                ) : (
                  <>
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Dashboard</span>
                  </>
                )}
              </div>
            </TooltipTrigger>

            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                href="#"
                onClick={() => {
                  setCurrentLink("otherPart");
                  navigate("/other");
                }}
                className={`flex h-9 w-full  items-center  ${
                  expanded ? "justify-start" : "justify-center"
                } ${
                  currentLink == "otherPart"
                    ? " text-foreground"
                    : "text-muted-foreground"
                } rounded-lg cursor-pointer transition-colors hover:text-foreground md:h-8 gap-2`}
              >
                {expanded ? (
                  <div className="flex w-full items-center justify-start gap-2 leading-none">
                    <SquarePlus className="h-5 w-5" />
                    <span>Other part</span>
                  </div>
                ) : (
                  <>
                    <SquarePlus className="h-5 w-5" />
                    <span className="sr-only">Other part</span>
                  </>
                )}
              </div>
            </TooltipTrigger>

            <TooltipContent side="right">Other part</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                href="#"
                onClick={() => {
                  setExpanded(!expanded);
                }}
                className={`flex h-9 group w-full  items-center  ${
                  expanded ? "justify-start" : "justify-center"
                } rounded-lg  cursor-pointer text-muted-foreground transition-colors hover:text-foreground md:h-8 gap-2`}
              >
                <div
                  className={`flex w-full items-center justify-start gap-5 leading-none ${
                    !expanded && " justify-center"
                  }`}
                >
                  <ArrowLeftFromLine
                    className={`h-5 w-5 transition-all ${
                      expanded
                        ? "rotate-180 group-hover:rotate-0"
                        : "group-hover:rotate-180"
                    }`}
                  />
                  <span className={`${!expanded ? "sr-only" : "not-sr-only"}`}>
                    {expanded ? "collapse" : "expand"}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            {expanded ? (
              <TooltipContent side="right">Collapse</TooltipContent>
            ) : (
              <TooltipContent side="right">Expand</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <Dialog>
          <DialogTrigger asChild>
            <div
              href="#"
              className={`flex h-9 w-full  items-center  ${
                expanded ? "justify-start" : "justify-center"
              } rounded-lg  cursor-pointer text-muted-foreground transition-colors hover:text-foreground md:h-8 gap-2`}
            >
              {expanded ? (
                <div className="flex w-full items-center justify-start gap-5 leading-none">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </div>
              ) : (
                <>
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex  items-center gap-2">
                Toggle Dark Mode{" "}
                <Switch
                  checked={theme == "dark"}
                  onCheckedChange={(e) => {
                    if (e) {
                      setTheme("dark");
                    } else {
                      setTheme("light");
                    }
                  }}
                />
              </DialogTitle>
              <DialogDescription>
                Tap to switch between light and dark themes for enhanced
                visibility in low-light environments.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </nav>
    </aside>
  );
}

export default Aside;

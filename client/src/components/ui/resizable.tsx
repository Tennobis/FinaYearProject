import * as React from "react"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ResizablePanelGroup as ResizablePanelGroupPrimitive,
  ResizablePanel as ResizablePanelPrimitive,
  ResizeHandle,
} from "react-resizable-panels"

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof ResizablePanelGroupPrimitive>,
  React.ComponentPropsWithoutRef<typeof ResizablePanelGroupPrimitive>
>(({ className, ...props }, ref) => (
  <ResizablePanelGroupPrimitive
    ref={ref}
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = React.forwardRef<
  React.ElementRef<typeof ResizablePanelPrimitive>,
  React.ComponentPropsWithoutRef<typeof ResizablePanelPrimitive>
>(({ ...props }, ref) => (
  <ResizablePanelPrimitive ref={ref} {...props} />
))
ResizablePanel.displayName = "ResizablePanel"

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof ResizeHandle>,
  React.ComponentPropsWithoutRef<typeof ResizeHandle> & {
    withHandle?: boolean
  }
>(({ withHandle, className, ...props }, ref) => (
  <ResizeHandle
    ref={ref}
    className={cn(
      "relative flex w-px select-none touch-none bg-border after:absolute after:top-1/2 after:left-1/2 after:z-40 after:translate-x-[-50%] after:translate-y-[-50%] after:h-8 after:w-1 after:rounded-full after:bg-border hover:after:bg-slate-700 after:transition-colors data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-8",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-40 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-700 bg-slate-800">
        <GripVertical className="h-2.5 w-2.5 text-slate-600" />
      </div>
    )}
  </ResizeHandle>
))
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

import React, { useEffect, useRef, useImperativeHandle } from "react"

import DragableLine from './_DragableLine'

interface ResizableSidePropsType {
  children?: React.ReactNode,
  initialApeture?: number,
  sidebarToggleHash?: string | number,
  open?: boolean,
  aperture?: number,
  direction?: 'right' | 'left' | 'top' | 'bottom',
  //minSize?: string,
  //maxSize?: string,
  //minWidth?: string | number,
  //maxWidth?: string | number,
  //minHeight?: string | number,
  //maxHeight?:  string | number,
  onApertureChange?: (aperture: number) => void,
  onOpen?: () => void,
  onClose?: () => void,
  separator?: React.ReactNode,
}

export default React.forwardRef(function ResizableSide (
  {
    children=undefined,
    initialApeture=undefined,
    sidebarToggleHash=undefined,
    open=undefined,
    aperture=undefined,
    direction='right',
    //minSize='64px',
    //maxSize='768px',
    //minWidth=undefined,
    //maxWidth=undefined,
    //minHeight=undefined,
    //maxHeight=undefined,
    onApertureChange=undefined,
    onOpen=undefined,
    onClose=undefined,
    separator=undefined,
    ...aditionalProps
  }: ResizableSidePropsType & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  forwardedRef
) {
  const containerRef = useRef<HTMLDivElement>()
  const resizableRef = useRef<any>()

  // Proxy containerRef to parent
  useImperativeHandle(forwardedRef, () => containerRef.current, []);

  useEffect(() => {
    if (!containerRef.current)
      return
      resizableRef.current = containerRef.current.firstChild
  }, [containerRef.current])

  return (
    <div
      data-testid='resizable-side'
      ref={containerRef}
      {...aditionalProps}
      style={{
        position: 'relative',
        ...aditionalProps.style || {}
      }}
    >
      { children }
      <DragableLine
        style={{
          'right': {
            position: 'absolute',
            cursor: 'col-resize',
            top: '0',
            left: '100%',
            width: '5px',
            height: '100%'
          },
          'left': {
            position: 'absolute',
            cursor: 'col-resize',
            top: '0',
            left: '0',
            width: '5px',
            height: '100%'
          },
          'top': {
            position: 'absolute',
            cursor: 'row-resize',
            top: '0',
            left: '0',
            width: '100%',
            height: '5px'
          },
          'bottom': {
            position: 'absolute',
            cursor: 'row-resize',
            top: '100%',
            left: '0',
            width: '100%',
            height: '5px'
          }
        }[direction] as React.CSSProperties}
        data-testid='vertical-dragable-line'
        containerRef={containerRef}
        resizableRef={resizableRef}
        initialApeture={initialApeture}
        sidebarToggleHash={sidebarToggleHash}
        open={open}
        aperture={aperture}
        direction={direction}
        //minSize={parseInt(minSize)}
        //maxSize={parseInt(maxSize)}
        //minWidth={minWidth}
        //maxWidth={maxWidth}
        //minHeight={minHeight}
        //maxHeight={maxHeight}
        onApertureChange={onApertureChange}
        onOpen={onOpen}
        onClose={onClose}
        separator={separator}
      />
    </div>
  )
})
import { css } from "@emotion/css"
import React, { 
  useEffect, 
  useRef, 
  useImperativeHandle, 
  useCallback, 
  useState, 
  useMemo
} from "react"

// Number in a string with format '0' or '0px' 
type PixelMetric = string
type ApertureType = number

interface ResizableSidePropsType {
  children?: React.ReactNode,
  direction?: 'right' | 'left' | 'top' | 'bottom',
  initialIsOpen?: boolean,
  isOpen?: boolean,
  initialAperture?: PixelMetric,
  aperture?: PixelMetric,
  minSize?: PixelMetric,
  maxSize?: PixelMetric,
  offsetpad?: PixelMetric,
  toggleIsOpenHash?: string | number, // When this value change the isOpen state is toggled
  onApertureChange?: (aperture: PixelMetric) => void,
  onIsOpenChange?: (isOpen: boolean) => void,
  //onOpen?: () => void,
  //onClose?: () => void,
  separator?: React.ReactNode,
}

interface StateType {
  isOpen?: boolean,
  aperture: ApertureType,
  afterSidebarToggleHash: number,
}

const parsePixelMetric = (value: PixelMetric, _default: any=undefined) => {
  if (
    typeof value === 'string' &&
    /[0-9]+(px)?/gi.test(value)
  ) {
    return parseInt(value)
  }
  return _default
}

const ResizableSide = React.forwardRef(function ResizableSide (
  {
    children=undefined,
    initialIsOpen=undefined,
    isOpen=undefined,
    onIsOpenChange=undefined,
    initialAperture=undefined,
    aperture=undefined,
    onApertureChange=undefined,
    direction='right',
    minSize='0',
    maxSize=undefined,
    offsetpad=undefined,
    toggleIsOpenHash=0,
    //onOpen=undefined,
    //onClose=undefined,
    separator=undefined,
    ...aditionalProps
  }: ResizableSidePropsType & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  forwardedRef
) {
  const [state, setState] = useState<StateType>({
    isOpen: initialIsOpen,
    aperture: parsePixelMetric(initialAperture),
    afterSidebarToggleHash: 0,
  })
  const containerRef = useRef<HTMLDivElement>()
  const dragableLineRef = useRef<HTMLDivElement>(null)
  const isVertical = direction === 'right' || direction === 'left'

  // Proxy containerRef to parent
  useImperativeHandle(forwardedRef, () => containerRef.current, []);

  /**************************************************************************
  * Utils
  **************************************************************************/
  const usingReferences = useCallback(function* () {
    if (
      containerRef.current === undefined || 
      dragableLineRef.current === undefined
    ) {
      return;
    }
    try {
      yield {
        container: containerRef.current,
        parent: containerRef.current.parentElement,
        dragableLine: dragableLineRef.current
      }
    } finally {}
  }, [
    containerRef.current,
    dragableLineRef.current,
  ])

  const toggleIsOpen = () => {
    if (isOpen === undefined) {
      setState((prev) => {
        return {
          ...prev,
          isOpen: !prev.isOpen,
          afterSidebarToggleHash: prev.afterSidebarToggleHash + 1,
        }
      })
    }
  }

  const frameAperture = useCallback((aperture: number) => {
    // Avoid aperture to grow or shrink on some limits
    for(const { parent } of usingReferences()) {
      const parentBoundaries = parent.getBoundingClientRect()
      const parentSize = isVertical ? parentBoundaries.width : parentBoundaries.height
      const parsedMaxSize = parsePixelMetric(maxSize)
      const parsedOffsetpad = parsePixelMetric(offsetpad)
      const parsedMinSize = parsePixelMetric(minSize, 0)

      if (aperture <= parsedMinSize) {
        aperture = parsedMinSize
      } else if (aperture > (parsedMaxSize || Infinity)) {
        aperture = parsedMaxSize
      } else if (aperture > (parsedMaxSize || Infinity)) {
        aperture = parentSize - (parsedMaxSize || 0)
      } else if (aperture > (parentSize - parsedOffsetpad)) {
        aperture = parentSize - parsedOffsetpad
      }
    }
    return aperture
  }, [
    usingReferences
  ])

  const setAperture = useCallback((aperture: ApertureType) => {
    if (typeof aperture === 'number') {
      aperture = frameAperture(aperture)
      setState((prev) => ({
        ...prev,
        aperture: aperture,
      }))
      if (isOpen !== undefined && onIsOpenChange) {
        // If component is controlled
        onIsOpenChange((aperture || 0) > parsePixelMetric(minSize, 0))
      } else {
        // If conponent is uncontrolled
        setState((prev) => ({
          ...prev,
          isOpen: (aperture || 0) > parsePixelMetric(minSize, 0),
        }))
      }
    } else {
      setState((prev) => ({
        ...prev,
        aperture: aperture
      }))
    }
  }, [
    frameAperture
  ])

  const resizeAperture = useCallback(() => {
    setState((prev) => {
      let aperture = frameAperture(prev.aperture)
      return {
        ...prev,
        aperture: aperture,
        isOpen: aperture === undefined || isOpen === undefined ? 
          prev.isOpen :
          (aperture || 0) > parsePixelMetric(minSize, 0),
      }
    })
  }, [
    frameAperture
  ])

  // Update width/height on dragging
  const updateSize = useCallback((value: string) => {
    for(const { container } of usingReferences()) {
      if (isVertical) {
        container.style.width = value
        container.style.minWidth = value
      } else {
        container.style.height = value
        container.style.minHeight = value
      }  
    }
  }, [
    usingReferences
  ])

  /**************************************************************************
  * Props setup
  **************************************************************************/

  const initialApertureRef = useRef(initialAperture)
  useEffect(() => {
    if (initialApertureRef.current !== initialAperture) {
      const parsedAperture = parsePixelMetric(initialAperture)
      setAperture(parsedAperture)
      initialApertureRef.current = initialAperture
    }
  }, [
    initialAperture,
    setAperture
  ])

  useEffect(() => {
    setState((prev) => {
      return prev.isOpen === initialIsOpen ?
        prev :
        {
          ...prev,
          isOpen: initialIsOpen,
          afterSidebarToggleHash: prev.afterSidebarToggleHash + 1,
        }
    })
  }, [initialIsOpen])

  useEffect(() => {
    if (isOpen !== undefined) {
      setState((prev) => ({
        ...prev,
        isOpen: isOpen,
        afterSidebarToggleHash: prev.afterSidebarToggleHash + 1,
      }))
    }
  }, [isOpen])

  /**************************************************************************
  * Open/Close container
  **************************************************************************/
  /* Change internal isOpen with toggle hash change */
  const toggleIsOpenHashRef = useRef(toggleIsOpenHash)
  useEffect(() => {
    if (toggleIsOpenHashRef.current !== toggleIsOpenHash) {
      toggleIsOpen()
    }
  }, [
    toggleIsOpenHash
  ])

  const transitionStyle = useMemo(() => css`
    transition: 
      max-width 0.5s, 
      max-height 0.5s,
      min-width 0.5s, 
      min-height 0.5s,
      width 0.5s, 
      height 0.5s;
  `, [])
  useEffect(() => {
    containerRef.current?.classList.add(transitionStyle)
    setTimeout(() => {
      containerRef.current?.classList.remove(transitionStyle)
    }, 0.5 * 1000)
  }, [state.afterSidebarToggleHash])
  /**************************************************************************
  * Change container width/height using aperture as source
  **************************************************************************/

  /* Change container size using state values */
  useEffect(() => {
    const parsedMinSize = parsePixelMetric(minSize, 0)
    if (
      !!state.isOpen && typeof state.aperture == 'number' && 
      state.aperture > parsedMinSize
    ) {
      updateSize(`${state.aperture}px`)
    } else if (!!state.isOpen && state.aperture === undefined) { 
      const parsedMaxSize = parsePixelMetric(maxSize)
      const parsedOffsetpad = parsePixelMetric(offsetpad)
      if (parsedMaxSize !== undefined) {
        updateSize(`${parsedMaxSize}px`)
      } else if (parsedOffsetpad !== undefined) {
        for(const { parent } of usingReferences()) {
          const parentBoundaries = parent.getBoundingClientRect()
          const parentSize = isVertical ? parentBoundaries.width : parentBoundaries.height
          updateSize(`${parentSize - parsedOffsetpad}px`)
        }
      } else {
        updateSize('max-content')
      }
    } else {
      updateSize(`${parsedMinSize}px`)
    }
  }, [
    updateSize,
    state.aperture,
    state.isOpen
  ])
  /* Set listeners to calculate apeture using mouse position */
  useEffect(() => {
    for(const { container,  dragableLine } of usingReferences()) {
      const onMouseMove = (event: MouseEvent) => {
        event.preventDefault()
        {
          // Calculate aperture using container boundaries
          const containerBoundaries = container.getBoundingClientRect()
          if (direction === 'right') {
            const aperture = event.clientX - containerBoundaries.left
            setAperture(aperture)
          } else if (direction === 'top') {
            const aperture = containerBoundaries.bottom - event.clientY
            setAperture(aperture)
          }
        }
      }
      const onMouseDown = () => {
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
      dragableLine.addEventListener('mousedown', onMouseDown)
      return () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        dragableLine.removeEventListener('mousedown', onMouseDown)
      }
    }
  }, [
    usingReferences,
  ])
  // Update aperture on parent resize
  const observerSizeRef = useRef<number>(undefined)
  useEffect(() => {
    let resizeObserver;
    for(const { parent } of usingReferences()) {
      resizeObserver = new ResizeObserver(() => {
        const parentBoundaries = parent.getBoundingClientRect()
        const parentSize = isVertical ? 
          parentBoundaries.width : parentBoundaries.height
        if (observerSizeRef.current !== parentSize) {
          observerSizeRef.current = parentSize
          // Update aperture on resize
          resizeAperture()
        }
      })
      resizeObserver.observe(parent)
    }
    return () => {
      resizeObserver.disconnect()
    }
  }, [
    usingReferences,
    resizeAperture,
  ])

  /**************************************************************************
  * Props callbacks
  **************************************************************************/

  const apertureRef = useRef(parsePixelMetric(initialAperture))
  useEffect(() => {
    if (apertureRef.current !== state.aperture) {
      onApertureChange && onApertureChange(
        state.aperture !== undefined ? `${state.aperture}px` : undefined
      )
    }
    apertureRef.current = state.aperture
  }, [
    onApertureChange,
    state.aperture,
  ])

  /**************************************************************************
  * Render component
  **************************************************************************/
  return (
    <div
      data-testid='resizable-side'
      ref={containerRef}
      {...aditionalProps}
      style={{
        position: 'relative',
        maxWidth: isVertical ? 'max-content' : undefined,
        maxHeight: isVertical ? undefined : 'max-content',
        ...aditionalProps.style || {}
      }}
    >
      { children }
      <div
        data-testid='dragable-line'
        ref={dragableLineRef}
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
            height: '5px',
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
      >
        {separator}
      </div>
    </div>
  )
})

export default ResizableSide
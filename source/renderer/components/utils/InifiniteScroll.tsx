import React, { 
  useRef, 
  useEffect, 
  ReactNode 
} from "react"

import BubbleSpinner from "@renderer/components/spinners/BubbleSpinner"
import styles from '@renderer/styles/infinite-scroll.module.css'

type ScrolledOverHash = string | number

interface InifiniteScrollProps {
  id?: string,
  className?: string,
  items: ReactNode[],
  hasMore?: boolean,
  loading?: boolean,
  inverse?: boolean,
  scrollThreshold?: number,
  adjustScrollHash?: string,
  scrollBeginingHash?: string,
  scrollEndHash?: string,
  scrolledOverHashMap?: {[key: string]: string | number},
  getItemIdentifier?: (...args: any[]) => string,
  scrolledOverToID?: (element: HTMLElement) => ScrolledOverHash,
  next?: (...args: any[]) => any,
  scrolledOver?: (scrolledOver: (string | number)[], ...args: any[]) => any,
}

export default function InifiniteScroll ({
  id='',
  className='',
  items=[],
  hasMore=false,
  loading=false,
  inverse=false,
  scrollThreshold=10,
  adjustScrollHash=undefined,
  scrollBeginingHash=undefined,
  scrollEndHash=undefined,
  scrolledOverHashMap={},
  getItemIdentifier=(item) => item.key === undefined ? item.toString() : item.key,
  scrolledOverToID=(item) => item.id,
  next=()=>{},
  scrolledOver=null,
}: InifiniteScrollProps) {
  /*
  * Notes:
  * This infinite scroll can't be used with flex-direction: column-inverse
  */
  const containerRef = useRef<HTMLDivElement>()

  const adjustScroll = () => {
    // Position the scroll in the starting side
    if (!containerRef.current)
      return

    if (inverse) {
      containerRef.current.scroll({
        top: containerRef.current.scrollHeight - lastScrollHeightRef.current,
        behavior: 'instant',
      })
    } else {
      containerRef.current.scroll({
        top: lastScrollHeightRef.current,
        behavior: 'instant',
      })
    }
  }

  const scrollBegining = () => {
    // Position the scroll in the starting side
    if (!containerRef.current)
      return

    if (inverse) {
      containerRef.current.scroll({
        top: containerRef.current.scrollHeight,
        behavior: 'instant',
      })
    } else {
      containerRef.current.scroll({ 
        top: 0,
        behavior: 'instant',
      })
    }
  }

  const scrollEnd = () => {
    // Position the scroll in the starting side
    if (!containerRef.current)
      return

    if (inverse) {
      containerRef.current.scroll({
        top: 0,
        behavior: 'instant',
      })
    } else {
      containerRef.current.scroll({ 
        top: containerRef.current.scrollHeight,
        behavior: 'instant',
      })
    }
  }

  useEffect(() => {
    if (items.length > 0) {
      adjustScroll()
    }
  }, [adjustScrollHash])

  useEffect(() => {
    if (items.length > 0) {
      scrollBegining()
    }
  }, [scrollBeginingHash])

  useEffect(() => {
    if (items.length > 0) {
      scrollEnd()
    }
  }, [scrollEndHash])

  const lastScrollHeightRef = useRef<number>(0)
  const itemsHash = JSON.stringify(items.map(getItemIdentifier))  
  const ListenToScrollEnd = () => {
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current

    lastScrollHeightRef.current = scrollHeight
    if (
      (inverse && scrollTop <= scrollThreshold) ||
      (!inverse && scrollTop + clientHeight >= scrollHeight - scrollThreshold)  
    ) {
      containerRef.current.removeEventListener('scroll', ListenToScrollEnd)
      next()
    }
  }

  useEffect(() => {
    // Checks if the scrolling has reached the end of the scrolling space
    if (containerRef.current === undefined)
      return

    if (hasMore) {
      containerRef.current.addEventListener('scroll', ListenToScrollEnd, {passive: true})
    } else {
      containerRef.current.removeEventListener('scroll', ListenToScrollEnd)
    }
    return () => containerRef.current.removeEventListener('scroll', ListenToScrollEnd)
  }, [
    containerRef.current, 
    itemsHash,
    hasMore
  ])

  /****************************************************************************
  * To listen when scrolled over elements
  ****************************************************************************/
  const lockHashMap = useRef<Map<any, ScrolledOverHash>>(new Map())
  useEffect(() => {
    // Checks if the scrolling has reached the end of the scrolling space
    if (containerRef.current === null) return

    const listener = () => {
      // Notify when a childelement has been scrolled over
      if (scrolledOver) {
        const { children, childElementCount } = containerRef.current
        const { 
          top: parentTop,
          bottom: parentBottom,
        } = containerRef.current.getBoundingClientRect()
        let references = Array()
        for (let i = 0; i < childElementCount; i++) {
          const element = children.item(i) as HTMLElement
          const reachedLine = element.getBoundingClientRect()[inverse ? 'top' : 'bottom']
          if (
            parentTop <= reachedLine &&
            parentBottom >= reachedLine
          ) {
            references.push(element)
          }
        }

        const scrolledOverItems = references
          .map(scrolledOverToID)
          .filter((id) => {
            const lastHash = lockHashMap.current.get(id)
            const hash = scrolledOverHashMap[id]
            lockHashMap.current.set(id, hash)
            return lastHash !== hash
          })

        if (scrolledOverItems.length > 0) {
          scrolledOver(scrolledOverItems)
        }
      }
    }
    containerRef.current.addEventListener(
      'scroll', listener, {passive: true})
    return () => containerRef.current.removeEventListener('scroll', listener)
  }, [containerRef.current, JSON.stringify(scrolledOverHashMap)])

  return (
    <div
      id={id}
      className={`${className} ${styles.container}`}
      ref={containerRef}
    >
      {
        loading && inverse ? 
        (
          <div className={styles['loader-row']}>
            <BubbleSpinner inverse={true} />
          </div>
        ) : 
        null
      }
      { items }
      {
        loading && !inverse ? 
          (
            <div className={styles['loader-row']}>
              <BubbleSpinner />
            </div>
          ) : 
          null
      }

    </div>
  )
}

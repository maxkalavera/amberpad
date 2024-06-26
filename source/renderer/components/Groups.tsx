import React, { useEffect, useRef, useState } from "react" 
import _ from 'lodash'
import { faLayerGroup, faPlus } from '@fortawesome/free-solid-svg-icons'

import store from "@renderer/utils/store"
import SelectedPage from "@renderer/components/SelectedPage"
import commonsSlice from "@renderer/actions/commons.slice"
import InifiniteScroll from '@renderer/components/utils/InifiniteScroll'
import CreateNotepad from '@renderer/components/modals/CreateNotepad'
import Notepad from '@renderer/components/Notepad'
import IconButton from '@renderer/components/IconButton'
import { fetchPagesThunk } from "@renderer/actions/notepads.slice"
import { fetchNotepadsThunk } from '@renderer/actions/notepads.slice'
import { useModal } from '@renderer/providers/Modal'
import styles from "@renderer/styles/groups.module.css" 

export default function Groups({ 
  className='',
}: { 
  className?: string,
}) {
  const [context, setContext] = useState({
    commons: {
      isSidebarOpen: true,
      search: '',
    },
    pages: {
      selectedPageID: undefined,
    },
    notepads: {
      values: [],
      page: 1,
      hasNextPage: true,
      adjustScrollHash: 0,
      scrollEndHash: 0,
      loading: false,
      paginationMap: {} as {
        [key: number]: {
            page: number,
            hasNext: boolean;
            isLoading: boolean;
            hash: number;
        }
      }
    }
  })
  const { showModal } = useModal()

  useEffect(() => {
    store.monitor(
      (state) => ({
        isSidebarOpen: state.commons.isSidebarOpen,
        search: state.commons.search,
        selectedPageID: state.pages.selectedPageID
      }),
      (state) => setContext((prev) => ({
        ...prev,
        commons: {
          isSidebarOpen: state.commons.isSidebarOpen,
          search: state.commons.search,
        },
        pages: {
          selectedPageID: state.pages.selectedPageID
        }
      }))
    )
  }, [])

  useEffect(() => {
    store.monitor(
      (state) => ({
        values: state.notepads.values,
        page: state.notepads.values,
        hasNextPage: state.notepads.hasNextPage,
        adjustScrollHash: state.notes.adjustScrollHash,
        scrollEndHash: state.notepads.scrollEndHash,
        paginationMap: state.notepads.paginationMap,
        loading: state.notepads.loading,
      }),
      (state) => setContext((prev) => ({
        ...prev,
        notepads: {
          ...state.notepads,
          values: state.notepads.values,
          page: state.notepads.page,
          hasNextPage: state.notepads.hasNextPage,
          adjustScrollHash: state.notepads.adjustScrollHash,
          scrollEndHash: state.notepads.scrollEndHash,
          loading: state.notepads.loading,
          paginationMap: state.notepads.paginationMap,
        }
      }))
    )
  })

  const toggleIsSidebarOpen = () => {
    const { mutateSidebarToggleHash } = commonsSlice.actions
    store.dispatch(mutateSidebarToggleHash())
  }

  const onScrollNext = () => {
    store.dispatch(fetchNotepadsThunk({
      page: context.notepads.page + 1,
      search: context.pages.selectedPageID === undefined ? context.commons.search  : ''
    }))   
  }

  const paginateOverScrolledOver = (elements: any[]) => {
    const forPagination = elements
    store.dispatch(fetchPagesThunk({
      notepads: forPagination,
      search: '',
    }))
  }

  return (
    <div 
      className={`${className} ${styles.container}`} 
    >
      <div
        className={`${styles.header}`}
      >
        <IconButton
          className={styles['show-frame-button']}
          icon={faLayerGroup}
          onClick={toggleIsSidebarOpen}
        />
        <h4 
          className={`secondary-h4 ${styles['header-title']}`}
        >
          Notepads / Pages
        </h4>
        <IconButton
          id={globals.ENVIRONMENT === 'testing' ? 'id:create-notepad-button:f9CFxx4pON' : ''}
          className={styles['add-button']} 
          icon={faPlus}
          onClick={() => {
            showModal(
              <CreateNotepad />,
              'New Notepad'
            )
          }}
        />
      </div>

      <SelectedPage 
        className={`${context.commons.isSidebarOpen ? '' : `${styles.transparent}` }`}
      />

      <InifiniteScroll
        className={[
          context.commons.isSidebarOpen ? '' : styles.hide,
          styles.content,
        ].join(' ')}
        id={globals.ENVIRONMENT === 'testing' ? 'id:notepad-list-container:7MLMomsYBt' : ''}
        hasMore={context.notepads.hasNextPage}
        next={onScrollNext}
        loading={context.notepads.loading}
        adjustScrollHash={`${context.notepads.adjustScrollHash}`}
        scrollEndHash={`${context.notepads.scrollEndHash}`}
        scrolledOver={paginateOverScrolledOver}
        scrolledOverToID={(item) => parseInt(item.id)}
        scrolledOverHashMap={_.mapValues(context.notepads.paginationMap, (object: any) => object.hash)}
        items={
          context.notepads.values.map((item: any, key: number) => (
            <Notepad 
              id={`${item.id}`}
              key={key}
              data={item}
              loading={context.notepads.paginationMap[item.id].isLoading}
            />
          ))
        }
      />
    </div> 
  ) 
}

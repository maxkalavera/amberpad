import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { Notepad } from '@ts/models/Notepads.types'

export interface NotepadsSliceState {
  values: Notepad[],
  page: number,
  hasNextPage: boolean,
  insertedTopHash: number,
  insertedBottomHash: number,
}

export const fetchNotepads = createAsyncThunk(
  'notepads/fetchNotepads',
  async (payload: { page: number, search: string}, thunkAPI) => {
    const response = await window.electronAPI.notepads.getAll({
      page: payload.page,
      search: payload.search
    })
    if (thunkAPI.signal.aborted)
      throw new Error('stop the work, this has been aborted!')
    return {
      page: payload.page,
      values: response
    }
  },
)

export const searchNotepads = createAsyncThunk(
  'notepads/searchNotepads',
  async (payload: { search: string }, thunkAPI) => {
    const response = await window.electronAPI.notepads.getAll({
      page: 1,
      search: payload.search
    })
    if (thunkAPI.signal.aborted)
      throw new Error('stop the work, this has been aborted!')
    return {
      page: 1,
      values: response
    }
  },
)

function set (
  state: NotepadsSliceState, 
  action: PayloadAction<{ values: Notepad[] }>
) {
  state.values = action.payload.values
}

function addTop (
  state: NotepadsSliceState, 
  action: PayloadAction<{ values: Notepad[] }>
) {
  state.values = 
    [...action.payload.values, ...state.values]
  state.insertedTopHash += 1
}

function addBotom (
  state: NotepadsSliceState, 
  action: PayloadAction<{ values: Notepad[] }>
) {
  state.values = 
    [...state.values, ...action.payload.values]
    state.insertedBottomHash += 1
}


function update (
  state: NotepadsSliceState, 
  action: PayloadAction<{ values: Notepad[] }>
) {
  state.values = state.values.map((item) => 
    action.payload.values.find((paylodItem) => paylodItem.id === item.id) || 
    item
  )
}

function destroy (
  state: NotepadsSliceState, 
  action: PayloadAction<{ values: Notepad[] }>
) {
  state.values = state.values.filter((item) =>
    !action.payload.values.some((payloadItem) => payloadItem.id === item.id)
  )
}

const notepadsSlice = createSlice({
  name: 'notepads',
  initialState: {
    values: [],
    page: 1,
    hasNextPage: true,
    insertedTopHash: 0,
    insertedBottomHash: 0,
  } as NotepadsSliceState,
  reducers: {
    set,
    addTop,
    addBotom,
    update,
    destroy,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotepads.fulfilled, (state, action) => {
      addBotom(
        state, 
        {
          ...action, 
          payload: {
            ...action.payload,
            values: action.payload.values
          }
        }
      )
      state.page = action.payload.page
      if (action.payload.values.length === 0) {
        state.hasNextPage = false
      }
    })
    builder.addCase(searchNotepads.fulfilled, (state, action) => {
      state.values = action.payload.values
      state.page = 1
      state.hasNextPage = true
      state.insertedBottomHash += 1
    })
  }
})

export default notepadsSlice
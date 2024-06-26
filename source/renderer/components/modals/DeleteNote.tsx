import React from "react"

import store from "@renderer/utils/store"
import { destroyNoteThunk } from "@renderer/actions/notes.slice"
import { useAlert } from "@renderer/providers/Alert"
import { useModal } from '@renderer/providers/Modal'
import Button from "@renderer/components/Button"
import styles from "@renderer/styles/delete-note-modal.module.css"

import type { Note } from "@commons/ts/models/Notes.types"

export default function DeleteNote({
  value,
  className='',
  onSuccess=()=>null,
  onCancel=()=>null,
}: {
  value: Note
  onSuccess?: (...args: any[]) => any
  onCancel?: (...args: any[]) => any
  className?: string
}) {
  const { showAlert } = useAlert()
  const { closeModal } = useModal()

  const destroyNote = () => {
    store.dispatch(destroyNoteThunk({ value: value })).then(() => {
      showAlert({ message: 'Note deleted', type: 'success' })
    })
  }

  const _onCancel = () => {
    onCancel()
    closeModal()
  }

  const _onSuccess = () => {
    destroyNote()
    onSuccess()
    closeModal()
  }

  return (
    <div className={`${className} ${styles.container}`}>
    <div className={styles.container}>
      <p className={`secondary-p ${styles.content}`}>
        Are you sure you want to delete the item?
      </p>
      <div className={styles.options}>
        <Button
          className={globals.ENVIRONMENT === 'testing' ? `class:modal-cancel-button:64CdoMr82v` : ''}
          label={'Cancel'}
          onClick={_onCancel}
        />
        <Button
          className={globals.ENVIRONMENT === 'testing' ? `class:modal-confirm-button:fHIbu0jVfe` : ''}
          label={'Delete'}
          onClick={_onSuccess}
        />
      </div>
    </div>
    </div>
  )
}
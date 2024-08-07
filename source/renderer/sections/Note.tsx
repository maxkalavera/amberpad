import React, { useRef, useState } from "react"
import { Node as SlateNode } from "slate"
import { Box, Card, Flex, IconButton } from "@radix-ui/themes"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { faClipboard, faTrashCan } from '@fortawesome/free-regular-svg-icons'

import { useAlert } from "@renderer/providers/AlertProvider"
import DropdownMenu from "@renderer/primitives/DropdownMenu"
import TextNote from "@renderer/components/TextNote"
import DeleteNote from "@renderer/dialogs/DeleteNote"

import type { AmberpadEditor } from "@renderer/utils/slate"
import type { BoxProps } from "@radix-ui/themes"
import type { NoteType } from '@ts/models/Notes.types'

function Note (
  { 
    data,
    ...containerProps
  }: BoxProps & { data: NoteType }
) {
  const [state, setState] = useState({
    isDeleteNoteOpen: false,
  })
  const editorRef = useRef<AmberpadEditor>()
  const { show } = useAlert()

  const copyClipboard = () => {
    if (editorRef) {
      const editor = editorRef.current
      navigator.clipboard.writeText(SlateNode.string(editor));
      show('Content copied to clipboard', 'success')
    }
  }

  return (
    <>
      <>
        <DeleteNote
          note={data}
          open={state.isDeleteNoteOpen}
          onOpenChange={(isOpen) => setState((prev) => ({...prev, isDeleteNoteOpen: isOpen}))}
        />
      </>
      <Box
        data-testid='note'
        maxWidth='100%'
        {...containerProps}
      >
        <Card
          data-radius='small'
        >
          <Flex
            maxWidth='100%'
            direction='row'
            gap='4'
            justify='end'
            align='start'
          >
            <Flex
              minWidth='0'
              pt='4'
              flexGrow='1'
              direction='column'
              gap='4'
              justify='start'
              align='end'
            >
              <TextNote 
                editorRef={editorRef}
                data={data}
              />
            </Flex>
            <Flex
              direction='column'
              gap='0'
              justify='start'
              align='start'
            >
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton
                    data-testid='note-options-button'
                    variant="ghost"
                    size='1'
                  >
                    <FontAwesomeIcon
                      size='sm'
                      icon={faEllipsisV}
                    />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  data-testid='note-options-menu'
                >
                  <DropdownMenu.Item
                    onClick={copyClipboard}
                  >
                    Copy
                    <FontAwesomeIcon
                      size='sm'
                      icon={faClipboard}
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    data-testid='note-options-delete-button' 
                    color="red"
                    onClick={() => setState((prev) => ({...prev, isDeleteNoteOpen: true}))}
                  >
                    Delete
                    <FontAwesomeIcon
                      size='sm'
                      icon={faTrashCan}
                    />
                  </DropdownMenu.Item>
                </DropdownMenu.Content>        
              </DropdownMenu.Root>
            </Flex>
          </Flex>
        </Card>
      </Box>
    </>
  )
}

export default Note
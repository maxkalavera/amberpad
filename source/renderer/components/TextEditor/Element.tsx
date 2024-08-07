import React from 'react'
import { css } from '@emotion/css'
import { Blockquote, Box, Checkbox, Heading, Text } from '@radix-ui/themes'

import { useAmberpadEditor } from '@renderer/utils/slate'

const defaultElement = (props) => {
  const { attributes, children } = props

  return (
    <Text 
      as='p'
      size='2'
      {...attributes}
    >
      {children}
    </Text>
  )
}

const TextElements = (props) => {
  const { attributes, children } = props
  return {
    'heading-one' : (
      <Heading
        {...attributes}
        as="h1"
        size='3'
      >
        {children}
      </Heading>
    ),
    'heading-two': (
      <Heading
        {...attributes}
        as="h2"
        size='2'
      >
        {children}
      </Heading>
    ),
    'heading-three': (
      <Heading
        {...attributes}
        as="h3"
        size='1'
      >
        {children}
      </Heading>
    ),
    'text-normal': defaultElement(props)
  }
}

const ListElements = (props) => {
  const { attributes, children } = props
  return {
    'numbered-list': (
      <ol 
        {...attributes}
        className={css`
          display: block;
          margin-block-start: 1em;
          margin-block-end: 1em;
          margin-inline-start: 0px;
          margin-inline-end: 0px;
          padding-inline-start: 40px;
          unicode-bidi: isolate;
        `}
      >
        {children}
      </ol>
    ), 
    'bulleted-list': (
      <ul 
        {...attributes}
        className={css`
          display: block;
          list-style-type: disc;
          margin-block-start: 1em;
          margin-block-end: 1em;
          margin-inline-start: 0px;
          margin-inline-end: 0px;
          padding-inline-start: 40px;
          unicode-bidi: isolate;
        `}
      >
        {children}
      </ul>
    ),
    'check-list': (
      <div
        className={css`
          display: block;
          list-style-type: disc;
          margin-block-start: 1em;
          margin-block-end: 1em;
          margin-inline-start: 0px;
          margin-inline-end: 0px;
          padding-inline-start: calc(40px - calc(var(--space-4) * 0.875) - var(--space-2));
          unicode-bidi: isolate;
        `}
      >
        {children}
      </div>
    ),
    'list-item': (
      <li {...attributes}>
        {children}
      </li>
    ),
    'check-list-item': (() => {
      const { element } = props
      const editor = useAmberpadEditor()
      return (
        <div 
          {...attributes}
          className={css`
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: var(--space-2);

            & + & {
              margin-top: 0;
            }
          `}
        >
          <Box
            as='span'
            contentEditable={false}
          >
            <Checkbox
              className={css`
                position: relative;
                vertical-align: middle;
              `}
              variant='surface'
              size='1'
              defaultChecked={!!element.checked}
              onCheckedChange={(value) => editor.setCheckListItemValue(element, value)}              
            />
          </Box>
          <Box
            as='span'
            suppressContentEditableWarning
            className={css`
              flex: 1;
              opacity: ${!!element.checked ? 0.666 : 1};
              text-decoration: ${!element.checked ? 'none' : 'line-through'};

              &:focus {
                outline: none;
              }
            `}
          >
            {children}
          </Box>
        </div>
      )
    })(),
  }
}

export default function Element (props) {
  const { element, attributes, children } = props;
  const textElements = TextElements(props)
  const listElements = ListElements(props)

  return {
    ...textElements,
    ...listElements,
    'block-code': (
      <code
        {...attributes}
      >
        {children}
      </code>
    ),
    'block-quote': (
      <Blockquote 
        {...attributes}
      >
        {children}
      </Blockquote>
    )
  }[element.type] || 
  defaultElement(props)
}
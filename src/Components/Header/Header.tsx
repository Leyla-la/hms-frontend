import { ActionIcon } from '@mantine/core'
import { IconBellRinging, IconLayoutSidebarLeftCollapseFilled } from '@tabler/icons-react'
import React from 'react'
import ProfileMenu from './ProfileMenu.tsx'

const Header = () => {
  return (
    <div className='bg-cyan-100 w-full h-16 flex justify-between px-5 items-center'>
      <ActionIcon variant='transparent' size='lg' aria-label='Collapse sidebar'>
        <IconLayoutSidebarLeftCollapseFilled style={{ width: '70%', height: '70%' }} stroke={1.5} />
      </ActionIcon>
      <div className='flex gap-5 items-center'>
        <ActionIcon variant='transparent' size='md' aria-label='Collapse sidebar'>
          <IconBellRinging style={{ width: '70%', height: '70%' }} stroke={2} />
        </ActionIcon>

        <ProfileMenu />
      </div>
    </div>
  )
}

export default Header

import { ActionIcon, Button } from '@mantine/core'
import { IconBellRinging, IconLayoutSidebarLeftCollapseFilled } from '@tabler/icons-react'
import ProfileMenu from './ProfileMenu.tsx'
import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { clearToken } from '../../Slices/JwtSlice.tsx'
import { removeUser } from '../../Slices/UserSlice.tsx'


const Header = () => {

  const jwt = useSelector((state: any) => state.jwt);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearToken());
    dispatch(removeUser());
  }
    // Access user state from Redux store
  return (
    <div className='bg-light shadow w-full h-16 flex justify-between px-5 items-center'>
      <ActionIcon variant='transparent' size='lg' aria-label='Collapse sidebar'>
        <IconLayoutSidebarLeftCollapseFilled style={{ width: '70%', height: '70%' }} stroke={1.5} />
      </ActionIcon>
      <div className='flex gap-5 items-center'>
        {jwt ? (
          <Link to="dashboard">
            <Button color='red' onClick={handleLogout}>Logout</Button>
          </Link>
        ) : <Link to="login"><Button>Login</Button></Link>}
        
        {jwt&&<><ActionIcon variant='transparent' size='md' aria-label='Collapse sidebar'>
          <IconBellRinging style={{ width: '70%', height: '70%' }} stroke={2} />
        </ActionIcon>
        <ProfileMenu /></>}
      </div>
    </div>
  )
}

export default Header

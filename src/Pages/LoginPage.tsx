import { Button, PasswordInput, TextInput } from '@mantine/core'
import { IconHeartbeat } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginUser } from '../Service/UserService.tsx'
import { errorNotification, successNotification } from '../Utility/NotificationUtil.tsx'
import { useDispatch } from 'react-redux'
import { setToken } from '../Slices/JwtSlice.tsx'
import { jwtDecode } from 'jwt-decode';
import { setUser } from '../Slices/UserSlice.tsx'

const LoginPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log('Form submitted with values:', values);
    setLoading(true);
    loginUser(values).then((response) => {
      console.log('User logged in successfully:', response);
      const user: any = jwtDecode(response);
      successNotification('User logged in successfully!');
      dispatch(setToken(response));
      dispatch(setUser(user));
    }).catch((error) => {
      console.error('Error logging in user:', error);
      errorNotification(error.response?.data?.errorMessage || 'Failed to log in. Please check your credentials and try again.');
    }).finally(() => {
      setLoading(false);
    });
  }

  return (
    <div
      className='h-screen w-screen !bg-cover !bg-center !bg-no-repeat flex items-center justify-center flex flex-col'
      style={{ backgroundImage: "url('/pulse-login-bg.jpg')" }}
    >
      <div className='flex py-3 z-[500] text-pink-500 gap-1 items-center'>
        <IconHeartbeat size={45} stroke={2.5} />
        <span className='font-heading font-semibold text-4xl'>Pulse</span>
      </div>
      <div className='w-[450px] backdrop-blur-md p-10 py-8 rounded-lg'>
        <form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col gap-5 [&_input]:placeholder:text-neutral-100 [&_.mantine-Input-input]:!border-white focus-within:[&_.mantine-Input-input]:!border-pink-400 [&_.mantine-Input-input]:!border [&_input]:!pl-2 [&_input]:text-light [&_svg]:!text-white'>
          <div className='self-center font-medium font-heading text-white text-xl'>Login</div>
          <TextInput
            className="transition duration-200"
            variant="unstyled"
            size="md"
            radius="md"
            placeholder="Enter your email"
            {...form.getInputProps('email')}
          />
          <PasswordInput
            variant="unstyled"
            placeholder="Enter your password"
            size="md"
            radius="md"
            mt="md"
            {...form.getInputProps('password')}
            styles={{ input: { backgroundColor: 'transparent' } }}
          />
          <Button loading={loading} radius="md" size='md' type='submit' color="pink">Login</Button>
          <div className='self-center text-neutral-100 text-sm'>Don't have an account? <Link className='hover:underline' to="/register">Register</Link> </div>
        </form>
      </div>
    </div>

  )
}

export default LoginPage

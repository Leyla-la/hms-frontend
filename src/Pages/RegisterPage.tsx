import { Button, PasswordInput, SegmentedControl, TextInput } from '@mantine/core'
import { IconHeartbeat } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../Service/UserService.tsx'
import { successNotification, errorNotification } from '../Utility/NotificationUtil.tsx'

const RegisterPage = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      role: 'PATIENT',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) =>
  !value
    ? "Password is required"
    : !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
    ? "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    : null,
      confirmPassword: (value, values) => (value !== values.password ? 'Passwords do not match' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log('Form submitted with values:', values);
    setLoading(true);
    const { confirmPassword, ...userData } = values;
    registerUser(userData).then((response) => {
      console.log('User registered successfully:', response);
      successNotification('User registered successfully!');
      navigate('/login');
    }).catch((error) => {
      console.error('Error registering user:', error);
      errorNotification(error.response?.data?.errorMessage || 'Failed to register user. Please try again.');

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
          <div className='self-center font-medium font-heading text-white text-xl'>Register</div>
          <SegmentedControl
            {...form.getInputProps('role')}
            fullWidth size="md" radius="md" color="pink" bg="none" className='[&_*]:!text-white border border-white'
            data={[{ label: 'Admin', value: 'ADMIN' }, { label: 'Patient', value: 'PATIENT' }, { label: 'Doctor', value: 'DOCTOR' }]} />
          <TextInput
            className="transition duration-200"
            variant="unstyled"
            size="md"
            radius="md"
            placeholder="Enter your name"
            {...form.getInputProps('name')}
          />
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
          />
          <PasswordInput
            variant="unstyled"
            placeholder="Confirm your password"
            size="md"
            radius="md"
            mt="md"
            {...form.getInputProps('confirmPassword')}
          />
          <Button loading={loading} radius="md" size='md' type='submit' color="pink">Register</Button>
          <div className='self-center text-neutral-100 text-sm'>Already have an account? <Link className='hover:underline' to="/login">Login</Link> </div>
        </form>
      </div>
    </div>

  )
}

export default RegisterPage

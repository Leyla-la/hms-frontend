import React from 'react';
import { Avatar } from '@mantine/core';
import useProtectedImage from './Dropzone/useProtectedImage.tsx';
import { useSelector } from 'react-redux';

const ProfileAvatar = ({ size = 40 }: { size?: number }) => {
  const profile = useSelector((s: any) => s.profile || {});
  const imageId = profile?.pictureId || profile?.profilePictureId || null;
  const protectedUrl = useProtectedImage(imageId);
  const src = profile?.pictureUrl || protectedUrl || '/ssmr-avt.jpg';
  return <Avatar src={src} radius="xl" size={size} />;
};

export default ProfileAvatar;

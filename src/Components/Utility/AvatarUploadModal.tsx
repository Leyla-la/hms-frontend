import React, { useEffect, useState } from 'react';
import { Modal, Avatar, Button, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto } from '@tabler/icons-react';

type Props = {
  opened: boolean;
  onClose: () => void;
  initialPreview?: string | null;
  onConfirm: (file: File | null, previewUrl: string | null) => void;
  maxSize?: number;
};

const AvatarUploadModal: React.FC<Props> = ({
  opened,
  onClose,
  initialPreview = null,
  onConfirm,
  maxSize = 5 * 1024 * 1024,
}) => {
  // tempPreview is only set when user selects a file; do NOT show initialPreview here
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const didConfirmRef = React.useRef(false);

  const [fileName, setFileName] = useState<string | null>(null);

  const tempPreviewRef = React.useRef<string | null>(null);

  useEffect(() => {
    tempPreviewRef.current = tempPreview;
  }, [tempPreview]);

  useEffect(() => {
    if (opened) {
      console.log('AvatarUploadModal: opened=true');
      // reset state when opening — do NOT prefill preview with initialPreview
      setTempPreview(null);
      setFile(null);
      setFileName(null);
      didConfirmRef.current = false;
      return;
    }

    // modal just closed
    console.log('AvatarUploadModal: opened=false');
    if (didConfirmRef.current) {
      // user confirmed — don't revoke preview here because parent will own it
      console.log('AvatarUploadModal: closed after confirm, leaving preview for parent');
      didConfirmRef.current = false;
      return;
    }

    // user cancelled/closed — revoke any blob URLs created by this modal
    const currentPreview = tempPreviewRef.current;
    if (currentPreview && currentPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(currentPreview); console.log('AvatarUploadModal: revoked tempPreview on close', currentPreview); } catch (e) {}
    }
    setTempPreview(null);
    setFile(null);
    setFileName(null);
  }, [opened]);

  useEffect(() => {
    // cleanup on unmount: revoke any leftover blob URL if NOT confirmed
    return () => {
      if (!didConfirmRef.current && tempPreviewRef.current && tempPreviewRef.current.startsWith('blob:')) {
        try { URL.revokeObjectURL(tempPreviewRef.current); console.log('AvatarUploadModal: cleanup revoke unmount', tempPreviewRef.current); } catch (e) {}
      }
    };
  }, []);

  const handleDrop = (files: any[]) => {
    // accept File[] or objects with a `file` property
    const candidate = files && files.length ? files[0] : null;
    const f: File | null = candidate?.file ? candidate.file : candidate;
    if (!f) {
      console.warn('AvatarUploadModal: dropped item is not a File', files);
      return;
    }
    const url = URL.createObjectURL(f as Blob);
    // revoke previous if blob
    if (tempPreview && tempPreview.startsWith('blob:')) URL.revokeObjectURL(tempPreview);
    console.log('AvatarUploadModal: file dropped', { name: f.name, size: f.size, type: f.type, url });
    setTempPreview(url);
    setFile(f);
    setFileName(f.name || null);
  };

  const handleConfirm = () => {
    console.log('AvatarUploadModal: confirm', { file, tempPreview });
    // mark confirming so close handler won't revoke the preview — parent takes ownership
    didConfirmRef.current = true;
    onConfirm(file, tempPreview);
    onClose();
  };

  return (
    <Modal centered opened={opened} onClose={onClose} title={<span className="text-xl font-medium">Upload Profile Image</span>} size="lg">
      <div className="flex flex-col gap-5">
        <Dropzone
          onDrop={handleDrop}
          onReject={(files) => console.log('Rejected files', files)}
          maxSize={maxSize}
          accept={IMAGE_MIME_TYPE}
          multiple={false}
          className="border-2 border-dashed border-neutral-200 rounded-xl bg-white/50 hover:bg-white/60 transition"
        >
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-3">
            <Dropzone.Accept>
              <IconUpload size={42} className="text-primary-600" />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={42} className="text-red-500" />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto size={42} className="text-primary-500" />
            </Dropzone.Idle>

            <div>
              <Text size="lg" fw={600}>
                Drag image here or click to select file
              </Text>
              <Text size="sm" c="dimmed">
                Only image files are allowed, max size {Math.round(maxSize / (1024 * 1024))} MB
              </Text>
            </div>
          </div>
        </Dropzone>

        <div className="flex flex-col items-center gap-3">
          <Text fw={600}>Preview</Text>
          <Avatar src={tempPreview ?? undefined} size={140} radius="xl" alt="Avatar preview">
            {!tempPreview && <IconPhoto size={48} />}
          </Avatar>
          {fileName && <Text size="sm" c="dimmed">{fileName}</Text>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Use this image
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AvatarUploadModal;

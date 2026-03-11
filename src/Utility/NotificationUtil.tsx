import { notifications } from "@mantine/notifications"
import { IconCheck, IconX } from "@tabler/icons-react"

const successNotification=(message:string)=>{
    notifications.show({
    title: 'Success',
    message: message,
    color: 'teal',
    icon: <IconCheck size={16} />,
    withCloseButton: true,
    withBorder: true,
    className: "border-green-500"
  });
}

const errorNotification=(message:string)=>{
    notifications.show({
    title: 'Error',
    message: message,
    color: 'red',
    icon: <IconX/>,
    withCloseButton: true,
    withBorder: true,
    className: "border-red-500"
  });
}

export {successNotification,errorNotification}
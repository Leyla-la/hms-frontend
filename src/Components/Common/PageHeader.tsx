import React from 'react';
import { Group, Stack, Text, Title } from '@mantine/core';

interface PageHeaderProps {
    title: string;
    description?: string;
    rightSection?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, rightSection }) => {
    return (
        <Group justify="space-between" align="center" mb="lg" gap="md">
            <Stack gap={2}>
                <Title order={2} fw={700} c="primary.6" style={{ fontFamily: 'Merriweather, serif', fontSize: '1.75rem' }}>
                    {title}
                </Title>
                {description && (
                    <Text size="sm" c="dimmed" fw={500}>
                        {description}
                    </Text>
                )}
            </Stack>
            {rightSection && (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    {rightSection}
                </div>
            )}
        </Group>
    );
};

export default PageHeader;

const formatDate = (dateString: any) => {
    if (!dateString) return undefined;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

const formatLocalDate = (dateValue: any) => {
    if (!dateValue) return null;
    return new Date(dateValue).toLocaleDateString('en-CA');
}

const formatDateWithTime = (dateString: any) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',  
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('en-US', options);
}

export { formatDate, formatLocalDate, formatDateWithTime };
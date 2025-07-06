import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

export const App = () => {
    const [message, setMessage] = useState('');
    console.log("alow")
    useEffect(() => {
        fetch('/api/hello')
            .then(res => res.json())
            .then(data => setMessage(data.message));
    }, []);

    return <div>{message}</div>;
}


const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App></App>);

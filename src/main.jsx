import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import App from './App.jsx'
import './index.css'

const theme = createTheme({
    fontFamily: "'Syne', sans-serif",
    fontFamilyMonospace: "'JetBrains Mono', monospace",
    primaryColor: 'teal',
    defaultRadius: 'md',
    colors: {
        dark: [
            '#C9CDD4',
            '#9EA3AD',
            '#6E7280',
            '#4C515C',
            '#353A43',
            '#252930',
            '#1A1D22',
            '#13151A',
            '#0D0F13',
            '#08090C',
        ],
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <App />
        </MantineProvider>
    </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import 'antd/dist/reset.css'
import App from './App'
import { AuthProvider } from './lib/auth'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3B82F6',
          colorInfo: '#3B82F6',
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          borderRadius: 12,
          colorBgLayout: '#F2F4F7',
          colorTextHeading: '#111827',
          colorText: '#1F2937',
          colorTextSecondary: '#6B7280',
          colorBorderSecondary: '#EEF0F3',
          fontFamily:
            "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          fontSize: 14,
        },
        components: {
          Layout: {
            siderBg: '#FFFFFF',
            headerBg: '#FFFFFF',
            bodyBg: '#F2F4F7',
            headerHeight: 64,
          },
          Menu: {
            itemSelectedBg: '#EFF6FF',
            itemSelectedColor: '#2563EB',
            itemBorderRadius: 10,
            itemHeight: 44,
            itemMarginInline: 8,
            iconSize: 18,
            fontSize: 14,
          },
          Card: { borderRadiusLG: 16 },
          Table: {
            headerBg: '#F9FAFB',
            headerColor: '#6B7280',
            borderColor: '#EEF0F3',
            rowHoverBg: '#F8FAFC',
            cellPaddingBlock: 14,
          },
          Button: {
            controlHeight: 38,
            borderRadius: 10,
            primaryShadow: 'none',
            fontWeight: 500,
          },
          Input: { controlHeight: 40, borderRadius: 10 },
          Modal: { borderRadiusLG: 16 },
          Segmented: { borderRadius: 8, trackBg: '#F3F4F6' },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>,
)

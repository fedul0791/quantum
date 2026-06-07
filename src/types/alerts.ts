export enum AlertType {
  PRICE = 'price',
  VOLUME = 'volume',
  TECHNICAL = 'technical',
  HEATMAP = 'heatmap'
}

export enum AlertNotificationMethod {
  EMAIL = 'email',
  BROWSER = 'browser',
  SMS = 'sms'
}

export interface Alert {
  id: string
  user_id: string
  symbol: string
  alert_type: AlertType
  condition: string
  threshold: number
  notification_methods: AlertNotificationMethod[]
  is_active: boolean
  created_at: string
  last_triggered?: string
}

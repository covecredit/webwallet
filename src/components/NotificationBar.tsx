import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { exchangeManager } from '../services/exchanges';
import { xrplService } from '../services/xrpl';
import { useWalletStore } from '../store/walletStore';

interface NotificationData {
  id: string;
  message: string;
  type: 'price' | 'system' | 'transaction';
}

const NotificationBar: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const { isConnected } = useWalletStore();

  useEffect(() => {
    const updateInterval = setInterval(async () => {
      const newNotifications: NotificationData[] = [];

      // Add exchange prices
      const exchanges = ['Bitfinex', 'Bitstamp', 'Kraken'] as const;
      exchanges.forEach(exchange => {
        const price = exchangeManager.getLastPrice(exchange);
        if (price?.lastPrice) {
          newNotifications.push({
            id: `price-${exchange}`,
            message: `${exchange}: XRP/USD $${price.lastPrice.toFixed(4)}`,
            type: 'price'
          });
        }
      });

      // Add XRPL network info if connected
      if (isConnected) {
        const client = xrplService.getClient();
        if (client?.isConnected()) {
          try {
            const [ledgerResponse, serverInfo] = await Promise.all([
              client.request({
                command: 'ledger',
                ledger_index: 'validated'
              }),
              client.request({
                command: 'server_info'
              })
            ]);
            
            if (ledgerResponse.result.ledger) {
              newNotifications.push({
                id: 'ledger',
                message: `Latest Validated Ledger: #${ledgerResponse.result.ledger_index}`,
                type: 'system'
              });

              const network = xrplService.getCurrentNetwork();
              newNotifications.push({
                id: 'network',
                message: `Connected to ${network?.name} | Server Version: ${serverInfo.result.info.build_version}`,
                type: 'system'
              });
            }
          } catch (error) {
            console.error('Failed to fetch network info:', error);
          }
        }
      }

      setNotifications(newNotifications);
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [isConnected]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 h-12 bg-background/80 backdrop-blur border-t border-primary/20"
    >
      <div 
        className="h-full overflow-hidden"
        style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}
      >
        <motion.div 
          className="h-full flex items-center space-x-16 whitespace-nowrap"
          animate={{
            x: [0, -2000],
            transition: {
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        >
          {[...notifications, ...notifications].map((notification, index) => (
            <span
              key={`${notification.id}-${index}`}
              className={`inline-flex items-center space-x-2 ${
                notification.type === 'price' ? 'text-primary' : 'text-text'
              }`}
            >
              <span className="text-primary">•</span>
              <span>{notification.message}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotificationBar;
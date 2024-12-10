# XRPL Wallet Interface

A modern, interactive wallet interface for the XRP Ledger (XRPL) built with React and TypeScript.

## Features

- Real-time XRP/USD price tracking
- Interactive transaction graph visualization
- Secure wallet management
- Transaction history
- NFT marketplace integration
- Animated UI elements with smooth transitions
- Responsive design for all screen sizes

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- React Force Graph
- XRPL.js
- Zustand
- Lucide Icons

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/xrpl-wallet.git
cd xrpl-wallet
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/     # React components
│   ├── AppBar/    # Application navigation
│   ├── Graph/     # Transaction graph visualization
│   ├── Header/    # App header with wallet connection
│   ├── Layout/    # Layout components
│   ├── Market/    # NFT marketplace
│   ├── Price/     # Price chart components
│   ├── Wallet/    # Wallet management
│   └── Widget/    # Draggable widget system
├── store/         # Zustand state management
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── hooks/         # Custom React hooks
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
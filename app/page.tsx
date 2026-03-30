import { ThemeProvider } from './components/ThemeProvider';
import QRCodeGenerator from './components/QRCodeGenerator';

export default function Home() {
  return (
    <ThemeProvider>
      <QRCodeGenerator />
    </ThemeProvider>
  );
}

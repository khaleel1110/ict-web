interface PaystackPop {
  setup(config: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    onClose: () => void;
    callback: (response: { reference: string; [key: string]: any }) => void;
  }): { openIframe: () => void };
}

interface Window {
  PaystackPop: PaystackPop;
}

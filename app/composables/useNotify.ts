interface NotifyState {
  show: boolean;
  text: string;
  color: 'success' | 'error';
}

export const useNotify = () => {
  const state = useState<NotifyState>('notify', () => ({
    show: false,
    text: '',
    color: 'success',
  }));

  const notify = (text: string, color: NotifyState['color'] = 'success') => {
    state.value = { show: true, text, color };
  };

  return { state, notify };
};

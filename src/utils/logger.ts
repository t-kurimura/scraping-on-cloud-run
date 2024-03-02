type Severity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'ALERT';

type Payload = { [key: string]: unknown };

const output = (severity: Severity, payload: Payload, error?: Error) => {
  const entry: { [key: string]: unknown } = {
    severity,
    ...payload,
  };
  if (error) {
    entry.errorMessage = error.message;
    entry.errorName = error.name;
  }
  if (severity === 'ERROR') {
    console.error(JSON.stringify(entry));
    return;
  }
  if (severity === 'WARNING') {
    console.warn(JSON.stringify(entry));
    return;
  }
  console.log(JSON.stringify(entry));
};

export const info = (payload: Payload) => {
  output('INFO', payload);
};

export const warning = (payload: Payload, error?: Error) => {
  output('WARNING', payload, error);
};

export const error = (payload: Payload, error?: Error) => {
  output('ERROR', payload, error);
};

export const debug = (payload: Payload, error?: Error) => {
  output('DEBUG', payload, error);
};

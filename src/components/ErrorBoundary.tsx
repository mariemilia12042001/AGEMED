import React from "react";

interface State {
  hasError: boolean;
  errorMessage: string;
}

interface Props {
  children: React.ReactNode;
}

// Barrera de errores para que un error de render no deje la pantalla en blanco.
// Muestra un mensaje amigable y un botón para volver al inicio.
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary capturó un error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
    // Volvemos al hash del dashboard para reiniciar la vista
    window.location.hash = "#/dashboard";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F5]">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h3 className="font-serif text-base font-bold text-stone-900">Ha ocurrido un inconveniente</h3>
        <p className="text-xs text-stone-500 mt-2 max-w-xs leading-relaxed">
          La pantalla no pudo cargarse correctamente. Puede volver al inicio y continuar navegando con normalidad.
        </p>
        <button
          type="button"
          onClick={this.handleReset}
          className="mt-5 bg-stone-950 hover:bg-stone-900 text-white font-bold py-2.5 px-5 rounded-xl text-xs cursor-pointer active:scale-98 transition"
        >
          Volver al inicio
        </button>
      </div>
    );
  }
}

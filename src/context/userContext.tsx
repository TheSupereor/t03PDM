import { createContext, JSXElementConstructor, ReactElement, ReactFragment, ReactPortal } from "react";

export const StateContext = createContext({});
export const ContextProvider = StateContext.Provider;
export const ContextConsumer = StateContext.Consumer;

// criando provedores de contexto

export const WithContextHOC = (Component: any) => (props: any) => {
  
  return(
    <ContextConsumer>
      {state => <Component {...props} supabase={state} />}
    </ContextConsumer>
)}

export const HOCProvider = (
  props: {
    children: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined;
    value: any;
  }) => {
  return(
    <ContextProvider value={props.value}>
      {props.children}
    </ContextProvider>
  )
}
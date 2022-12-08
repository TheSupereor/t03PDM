import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ContextProvider } from './src/context/userContext';

// importando a página de login
import Auth from './src/pages/login';
import Account from './src/pages/updateUser';

// criando o navegador
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// abas quando o usuário está logado
function LoggedUser() {  
  return (
    <Tab.Navigator initialRouteName=''>
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

function App() {
  const [context, setContext] = useState({});

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="login" component={Auth} initialParams={setContext}/>
        <ContextProvider value={context}>
          <Stack.Screen
            name="LoggedUser"
            component={LoggedUser}
            options={{ headerShown: false }}
          />
        </ContextProvider>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

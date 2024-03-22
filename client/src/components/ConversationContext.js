import React, { createContext, useContext, useReducer } from 'react';

const ConversationContext = createContext(null);
const ConversationDispatchContext = createContext(null);

export function ConversationProvider({ children }) {
  const [conversations, dispatch] = useReducer(conversationsReducer, {});

  return (
    <ConversationContext.Provider value={conversations}>
      <ConversationDispatchContext.Provider value={dispatch}>
        {children}
      </ConversationDispatchContext.Provider>
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  return useContext(ConversationContext);
}

export function useConversationDispatch() {
  return useContext(ConversationDispatchContext);
}

function conversationsReducer(conversations, action) {
  switch (action.type) {
    case 'newMessage':
      const { sender, receiver, text } = action.payload;
      const key = getConversationKey(sender, receiver);
      const updatedConversations = { ...conversations };

      if (!updatedConversations[key]) {
        updatedConversations[key] = [];
      }

      updatedConversations[key].push({ sender, text });
      return updatedConversations;

    default:
      throw new Error('Unknown action: ' + action.type);
  }
}

function getConversationKey(user1, user2) {
  return [user1, user2].sort().join('_');
}

// src/components/ui/UserSearch.tsx

import { useState, useEffect } from "react";
import { 
    Combobox,
    Highlight,
    Portal,
    useComboboxContext ,
    useListCollection,
    HStack,
    Spinner,
    Span,
 } from "@chakra-ui/react";
import apiClient from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAsync } from "react-use";

interface SearchedUser {
    id: string;
    username: string;
}
function UserComboboxItem({item}: {item: SearchedUser}) {
    const combobox = useComboboxContext();
    return (
        <Combobox.Item item={{ label: item.username, value: item.id}}>
            <Combobox.ItemText>
                <Highlight
                    query={combobox.inputValue}
                    styles={{bg:"teal.100", fontWeight: "medium"}}
                >
                    {item.username}
                </Highlight>
            </Combobox.ItemText>

        </Combobox.Item>
    );
}
export default function UserSearch() {
    const [inputValue, setInputValue] = useState("");
    const navigate = useNavigate();

    const { collection, set } = useListCollection<SearchedUser>({
        initialItems: [],
        itemToString: (item) => item.username,
        itemToValue: (item)=> item.id,
    });
    const state = useAsync(async () => {
        if (inputValue.length < 2) {
            set([]);
            return;
        }
        const response = await apiClient.get<SearchedUser[]>(`/users/search?q=${inputValue}`);
        set(response.data);
    },[inputValue, set])
    
    return (
        <Combobox.Root
            collection={collection}
            onInputValueChange={(e) => setInputValue(e.inputValue)}
            onValueChange={(details) => {
                // when an item is selected
                if (details.value){
                    const selectedUser = collection.items.find(item => item.id === details.value[0]);
                    if (selectedUser) {
                        navigate(`/users/${selectedUser.username}`);
                        setInputValue("");
                    }
                }
            }}
        >
            <Combobox.Control>
                <Combobox.Input
                    placeholder = "Search for users. . ."
                    bg="white"
                    color="black"
                />
                <Combobox.Trigger/>
                
            </Combobox.Control>
            <Portal>
                <Combobox.Positioner>
                    <Combobox.Content>
                        {state.loading ? (
                            <HStack>
                                <Spinner size="sm" color="blue.solid"/>
                                <Span>Searching...</Span>
                            </HStack>
                        ) : state.error ? (
                            <Span p="2" color="red.500">
                                Error Searching for users
                            </Span>
                        ) : (
                            collection.items.map((item) =>(
                                <UserComboboxItem key={item.id} item={item}/>
                            ))
                        )}
                        {inputValue.length > 1 && !state.loading && collection.items.length === 0 && (
                            <Combobox.Empty>
                                No users found
                            </Combobox.Empty>
                        )}
                    </Combobox.Content>
                </Combobox.Positioner>
            </Portal>

        </Combobox.Root>
    );
}

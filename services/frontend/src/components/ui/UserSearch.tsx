// src/components/ui/UserSearch.tsx

import { useState } from "react";
import { 
    Combobox,
    Highlight,
    Portal,
    useComboboxContext,
    useListCollection,
    HStack,
    Spinner,
    Span,
 } from "@chakra-ui/react";
import {api, User} from "@/services/api";
// import { useNavigate } from "react-router-dom";
import { useAsync } from "react-use";

// interface SearchedUser {
//     id: string;
//     username: string;
// }
interface UserSearchProps {
    onUserSelected: (user: User) => void;
    zIndex?: string;
}

function UserComboboxItem({item}: {item: User}) {
    const combobox = useComboboxContext();
    return (
        <Combobox.Item item={{ label: item.username, value: item.id, user:item}}>
            <Combobox.ItemText>
                <Highlight
                    query={combobox.inputValue}
                    styles={{bg:"teal.100", fontWeight: "medium"}}
                >
                    {item.username}
                </Highlight>
                <Span color="gray.500" ml={2} fontSize="sm">
                    {item.email}
                </Span>
            </Combobox.ItemText>

        </Combobox.Item>
    );
}
export default function UserSearch({onUserSelected, zIndex}: UserSearchProps) {
    const [inputValue, setInputValue] = useState("");
    //const navigate = useNavigate();

    const { collection, set } = useListCollection<User>({
        initialItems: [],
        itemToString: (item) => item.username,
        itemToValue: (item)=> item.id,
    });
    const state = useAsync(async () => {
        if (inputValue.length < 2) return [];
        const response = await api.searchUsers(inputValue);
        set(response.data);
        return response.data;
    },[inputValue, set]);

    // const handleValueChange = (details: Combobox.ValueChangeDetails) => {
    //     const selectedId = details.value[0];
    //     if (!selectedId) return;

    //     const selectedUser = collection.items.find((user) => user.id === selectedId);

    //     if (selectedUser) {
    //         onUserSelected(selectedUser);
    //         setInputValue(selectedUser.username);
    //     }
    // };
    
    return (
        <Combobox.Root
            collection={collection}
            onInputValueChange={(details) => setInputValue(details.inputValue)}
            onSelect={(item) => {
                const selectedUser = collection.items.find(
                    (u) => u.id === item.itemValue
                );
                if (selectedUser) {
                    onUserSelected(selectedUser);
                }
            }
            
            }
            
            // onValueChange={(details) => {
            //     // when an item is selected
            //     if (details.value){
            //         const selectedUser = collection.items.find(item => item.id === details.value[0]);
            //         if (selectedUser) {
            //             navigate(`/users/${selectedUser.username}`);
            //             setInputValue("");
            //         }
            //     }
            // }}
        >
            <Combobox.Control>
                <Combobox.Input
                    placeholder = "Search for users. . ."
                    bg="white"
                    color="black"
                />
                <Combobox.Trigger/>
                
            </Combobox.Control>
                <Combobox.Positioner zIndex={zIndex}>
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
                        {inputValue.length > 1 && 
                            !state.loading && 
                            collection.items.length === 0 && (
                            <Combobox.Empty>
                                No users found
                            </Combobox.Empty>
                        )}
                    </Combobox.Content>
                </Combobox.Positioner>
        </Combobox.Root>
    );
}

package com.omatheusmesmo.shoppmate.list.service;

import com.omatheusmesmo.shoppmate.item.entity.Item;
import java.math.BigDecimal;
import com.omatheusmesmo.shoppmate.item.service.ItemService;
import com.omatheusmesmo.shoppmate.list.dtos.ListItemRequestDTO;
import com.omatheusmesmo.shoppmate.list.dtos.ListItemUpdateRequestDTO;
import com.omatheusmesmo.shoppmate.list.entity.ListItem;
import com.omatheusmesmo.shoppmate.list.entity.ShoppingList;
import com.omatheusmesmo.shoppmate.list.mapper.ListItemMapper;
import com.omatheusmesmo.shoppmate.list.repository.ListItemRepository;
import com.omatheusmesmo.shoppmate.shared.service.AuditService;
import com.omatheusmesmo.shoppmate.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ListItemServiceTest {

    @Mock
    private ListItemRepository listItemRepository;
    @Mock
    private ShoppingListService shoppingListService;
    @Mock
    private ItemService itemService;
    @Mock
    private AuditService auditService;
    @Mock
    private ListItemMapper listItemMapper;

    @InjectMocks
    private ListItemService service;

    private ListItemRequestDTO listItemRequestDTO;
    private Item item;
    private ShoppingList shoppingList;
    private ListItem listItem;
    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        listItemRequestDTO = createSampleItem();

        item = new Item();
        item.setId(1L);

        user = new User();
        user.setId(1L);

        shoppingList = new ShoppingList();
        shoppingList.setId(1L);
        shoppingList.setOwner(user);

        listItem = new ListItem();
        listItem.setId(1L);
        listItem.setItem(item);
        listItem.setShoppList(shoppingList);
        listItem.setQuantity(2);
        listItem.setPurchased(false);
    }

    @Test
    void addShoppItemList() {
        when(itemService.findById(1L)).thenReturn(item);
        when(shoppingListService.findListById(1L)).thenReturn(shoppingList);
        when(listItemMapper.toEntity(listItemRequestDTO, item, shoppingList)).thenReturn(listItem);
        when(listItemRepository.save(listItem)).thenReturn(listItem);

        ListItem savedItem = service.addShoppItemList(listItemRequestDTO, user);

        assertNotNull(savedItem);
        assertEquals(savedItem, listItem);
        verify(itemService, times(1)).isItemValid(listItem.getItem());
        verify(shoppingListService, times(1)).isListValid(listItem.getShoppList());
        verify(auditService, times(1)).setAuditData(listItem, true);
        verify(listItemRepository, times(1)).save(listItem);
    }

    @Test
    void isListItemValid_NoException() {
        assertDoesNotThrow(() -> service.isListItemValid(listItem));

        verify(itemService, times(1)).isItemValid(listItem.getItem());
        verify(shoppingListService, times(1)).isListValid(listItem.getShoppList());
    }

    @Test
    void isListItemValid_InvalidItemQuantity() {
        listItem.setQuantity(null);

        assertThrows(IllegalArgumentException.class, () -> service.isListItemValid(listItem));

        verify(itemService, times(1)).isItemValid(listItem.getItem());
        verify(shoppingListService, times(1)).isListValid(listItem.getShoppList());
    }

    @Test
    void findListItem() {
        when(shoppingListService.findAndVerifyAccess(shoppingList.getId(), user)).thenReturn(shoppingList);
        when(listItemRepository.findByIdAndShoppListIdAndDeletedFalseFetchShoppList(listItem.getId(),
                shoppingList.getId())).thenReturn(Optional.of(listItem));

        ListItem result = service.findListItemById(shoppingList.getId(), listItem.getId(), user);

        assertNotNull(result);

        verify(shoppingListService, times(1)).findAndVerifyAccess(shoppingList.getId(), user);
        verify(listItemRepository, times(1)).findByIdAndShoppListIdAndDeletedFalseFetchShoppList(listItem.getId(),
                shoppingList.getId());
    }

    @Test
    void findListItemById() {
        when(shoppingListService.findAndVerifyAccess(shoppingList.getId(), user)).thenReturn(shoppingList);
        when(listItemRepository.findByIdAndShoppListIdAndDeletedFalseFetchShoppList(listItem.getId(),
                shoppingList.getId())).thenReturn(Optional.of(listItem));

        ListItem result = service.findListItemById(shoppingList.getId(), listItem.getId(), user);

        assertNotNull(result);

        verify(shoppingListService, times(1)).findAndVerifyAccess(shoppingList.getId(), user);
        verify(listItemRepository, times(1)).findByIdAndShoppListIdAndDeletedFalseFetchShoppList(listItem.getId(),
                shoppingList.getId());
    }

    @Test
    void findListItemById_WhenItemNotFound() {
        when(shoppingListService.findAndVerifyAccess(shoppingList.getId(), user)).thenReturn(shoppingList);
        when(listItemRepository.findByIdAndShoppListIdAndDeletedFalseFetchShoppList(anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.findListItemById(shoppingList.getId(), 999L, user));

        verify(listItemRepository, never()).save(any());
    }

    @Test
    void removeList_Ok() {
        when(shoppingListService.findAndVerifyAccess(shoppingList.getId(), user)).thenReturn(shoppingList);
        when(listItemRepository.findByIdAndShoppListIdAndDeletedFalseFetchShoppList(listItem.getId(),
                shoppingList.getId())).thenReturn(Optional.of(listItem));

        assertDoesNotThrow(() -> service.removeList(shoppingList.getId(), listItem.getId(), user));

        verify(listItemRepository, times(1)).save(listItem);
        verify(auditService, times(1)).softDelete(listItem);
    }

    @Test
    void removeList_ItemNotFound() {
        when(shoppingListService.findAndVerifyAccess(shoppingList.getId(), user)).thenReturn(shoppingList);
        when(listItemRepository.findByIdAndShoppListIdAndDeletedFalseFetchShoppList(anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.removeList(shoppingList.getId(), 999L, user));

        verify(listItemRepository, never()).save(any());
        verify(auditService, never()).softDelete(any());
    }

    @Test
    void editList_Ok() {
        ListItemUpdateRequestDTO updateDTO = new ListItemUpdateRequestDTO(1L, 1L, 3, true, BigDecimal.valueOf(10.0));
        when(shoppingListService.findAndVerifyAccess(shoppingList.getId(), user)).thenReturn(shoppingList);
        when(listItemRepository.findByIdAndShoppListIdAndDeletedFalseFetchShoppList(listItem.getId(),
                shoppingList.getId())).thenReturn(Optional.of(listItem));

        ListItem result = service.editList(shoppingList.getId(), listItem.getId(), updateDTO, user);

        assertNotNull(result);
        assertEquals(3, result.getQuantity());
        assertTrue(result.getPurchased());
        assertEquals(BigDecimal.valueOf(10.0), result.getUnitPrice());

        verify(auditService, times(1)).setAuditData(listItem, false);
        verify(listItemRepository, times(1)).save(listItem);
    }

    @Test
    void editList_WhenListItemNotFound() {
        ListItemUpdateRequestDTO updateDTO = new ListItemUpdateRequestDTO(1L, 1L, 3, true, BigDecimal.valueOf(20.0));
        when(shoppingListService.findAndVerifyAccess(shoppingList.getId(), user)).thenReturn(shoppingList);
        when(listItemRepository.findByIdAndShoppListIdAndDeletedFalseFetchShoppList(anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.editList(shoppingList.getId(), 1L, updateDTO, user));

        verify(listItemRepository, times(1)).findByIdAndShoppListIdAndDeletedFalseFetchShoppList(anyLong(), anyLong());
    }

    @Test
    void findAll() {
        when(listItemRepository.findByShoppListIdAndDeletedFalse(1L)).thenReturn(List.of(listItem));
        doNothing().when(shoppingListService).verifyOwnership(anyLong(), any(User.class));

        List<ListItem> result = service.findAll(1L, user);

        assertNotNull(result);
        assertEquals(1, result.size());

        verify(listItemRepository, times(1)).findByShoppListIdAndDeletedFalse(1L);
        verify(shoppingListService, times(1)).verifyOwnership(1L, user);
    }

    private ListItemRequestDTO createSampleItem() {
        return new ListItemRequestDTO(1L, 1L, 2, BigDecimal.valueOf(10.0));
    }
}

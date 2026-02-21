package com.omatheusmesmo.shoppmate.list.service;

import com.omatheusmesmo.shoppmate.item.entity.Item;
import com.omatheusmesmo.shoppmate.list.dtos.ListItemRequestDTO;
import com.omatheusmesmo.shoppmate.list.dtos.ListItemUpdateRequestDTO;
import com.omatheusmesmo.shoppmate.list.entity.ListItem;
import com.omatheusmesmo.shoppmate.list.entity.ShoppingList;
import com.omatheusmesmo.shoppmate.list.mapper.ListItemMapper;
import com.omatheusmesmo.shoppmate.list.repository.ListItemRepository;
import com.omatheusmesmo.shoppmate.item.service.ItemService;
import com.omatheusmesmo.shoppmate.shared.service.AuditService;
import com.omatheusmesmo.shoppmate.user.entity.User;
import com.omatheusmesmo.shoppmate.utils.exception.ResourceOwnershipException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ListItemService {

    private final ListItemRepository ListItemRepository;

    private final ShoppingListService shoppingListService;

    private final ItemService itemService;

    private final AuditService auditService;

    private final ListItemMapper listItemMapper;

    public ListItemService(ListItemRepository listItemRepository, ShoppingListService shoppingListService,
            ItemService itemService, AuditService auditService, ListItemMapper listItemMapper) {
        ListItemRepository = listItemRepository;
        this.shoppingListService = shoppingListService;
        this.itemService = itemService;
        this.auditService = auditService;
        this.listItemMapper = listItemMapper;
    }

    public ListItem addShoppItemList(ListItemRequestDTO listItemRequestDTO, User user) {
        Item item = itemService.findById(listItemRequestDTO.itemId());
        ShoppingList shoppingList = shoppingListService.findListById(listItemRequestDTO.listId());

        if (!shoppingList.getOwner().getId().equals(user.getId())) {
            throw new ResourceOwnershipException("You can only add items to your own shopping lists");
        }

        ListItem listItem = listItemMapper.toEntity(listItemRequestDTO, item, shoppingList);

        isListItemValid(listItem);
        auditService.setAuditData(listItem, true);
        ListItemRepository.save(listItem);
        return listItem;
    }

    public void isListItemValid(ListItem ListItem) throws NoSuchElementException {
        itemService.isItemValid(ListItem.getItem());
        shoppingListService.isListValid(ListItem.getShoppList());

        checkQuantity(ListItem);
    }

    private void checkQuantity(ListItem ListItem) {
        if (ListItem.getQuantity() == null || ListItem.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be informed and greater than 0!");
        }
    }

    public ListItem findListItemById(Long id, User user) {
        ListItem listItem = ListItemRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new NoSuchElementException("ListItem not found"));

        if (!listItem.getShoppList().getOwner().getId().equals(user.getId())) {
            throw new ResourceOwnershipException("You do not have permission to access this item");
        }

        return listItem;
    }

    public void removeList(Long id, User user) {
        ListItem deletedItem = findListItemById(id, user);
        auditService.softDelete(deletedItem);
        ListItemRepository.save(deletedItem);
    }

    public ListItem editList(Long id, ListItemUpdateRequestDTO listItemUpdateRequestDTO, User user) {
        ListItem existingListItem = findListItemById(id, user);

        existingListItem.setQuantity(listItemUpdateRequestDTO.quantity());
        existingListItem.setPurchased(listItemUpdateRequestDTO.purchased());
        existingListItem.setUnitPrice(listItemUpdateRequestDTO.unitPrice());

        auditService.setAuditData(existingListItem, false);
        ListItemRepository.save(existingListItem);
        return existingListItem;
    }

    public List<ListItem> findAll(Long idList, User user) {
        shoppingListService.verifyOwnership(idList, user);
        return ListItemRepository.findByShoppListIdAndDeletedFalse(idList);
    }
}

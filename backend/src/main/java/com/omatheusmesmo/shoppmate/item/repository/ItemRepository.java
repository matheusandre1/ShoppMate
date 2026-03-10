package com.omatheusmesmo.shoppmate.item.repository;

import com.omatheusmesmo.shoppmate.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("SELECT i FROM Item i LEFT JOIN FETCH i.category LEFT JOIN FETCH i.unit WHERE i.id = :id AND i.deleted = false")
    Optional<Item> findByIdWithRelations(@Param("id") Long id);
}

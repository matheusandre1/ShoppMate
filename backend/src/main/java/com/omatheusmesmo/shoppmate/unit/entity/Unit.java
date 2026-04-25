package com.omatheusmesmo.shoppmate.unit.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.omatheusmesmo.shoppmate.shared.domain.DomainEntity;

@Entity
@Table(name = "units")
@Getter
@Setter
public class Unit extends DomainEntity {

    private String symbol;
}

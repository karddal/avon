package uk.ac.bristol.cs.carc.db.util;

import uk.ac.bristol.cs.carc.db.domain.shared.Id;

import java.util.*;
import java.util.function.Function;
import java.util.function.Supplier;

public final class IdConverter {
    public static <T> T toDb(Id<T> id) {
        return id == null ? null : id.getValue();
    }

    public static <T, C extends Collection<T>> C toDbCollection(Collection<? extends Id<T>> ids, Supplier<C> target) {
        Objects.requireNonNull(target);

        C collection = target.get();

        if (ids == null || ids.isEmpty()) return collection;

        for (Id<T> id : ids) {
            if (id == null) continue;
            T dbValue = id.getValue();
            if (dbValue == null) continue;
            collection.add(dbValue);
        }

        return collection;
    }

    public static <T, D extends Id<T>> D toDomainId(T dbValue, Function<T, D> factory) {
        Objects.requireNonNull(factory, "no result type factory provided");
        return dbValue == null ? null : (D) factory.apply(dbValue);
    }

    public static <T, D extends Id<T>, C extends Collection<D>> C toDomainCollection(Collection<T> dbValues, Function<T, D> factory, Supplier<C> target) {
        Objects.requireNonNull(factory, "no result type factory provided");
        Objects.requireNonNull(dbValues, "no collection type provided");

        C collection = target.get();

        if (dbValues == null || dbValues.isEmpty()) return collection;

        for (T dbValue : dbValues) {
            if (dbValue == null) continue;
            collection.add(factory.apply(dbValue));
        }

        return collection;
    }

    //fast implementations for common collection types

    public static <T> List<T> toDbList(Collection<? extends Id<T>> ids) {
        return toDbCollection(ids, ArrayList::new);
    }

    public static <T> Set<T> toDbSet(Collection<? extends Id<T>> ids) {
        return toDbCollection(ids, HashSet::new);
    }

    public static <T, D extends Id<T>> List<D> toDomainList(Collection<T> dbValues, Function<T, D> factory) {
        return toDomainCollection(dbValues, factory, ArrayList::new);
    }

    public static <T, D extends Id<T>> Set<D> toDomainSet(Collection<T> dbValues, Function<T, D> factory) {
        return toDomainCollection(dbValues, factory, HashSet::new);
    }

    private IdConverter() {}
}

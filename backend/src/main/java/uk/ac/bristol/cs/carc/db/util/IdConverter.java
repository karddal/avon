package uk.ac.bristol.cs.carc.db.util;

import uk.ac.bristol.cs.carc.db.domain.shared.Id;

import java.util.*;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * The converter that convert between wrapped id and entity id used in the database
 * @see Id for the generic function of wrapper
 * @see uk.ac.bristol.cs.carc.db.domain.ids.StudentId for an example wrapped id
 */
public final class IdConverter {
    /**
     * The wrapped id convert to the entity id
     *
     * @param id Wrapper of id use in domain level
     * @return Extract the wrapped id to the entity id used in the database
     * @param <T> The type that the entity primary key used
     */
    public static <T> T toDb(Id<T> id) {
        return id == null ? null : id.getValue();
    }

    /**
     * The Collection of wrapped id convert to a Collection of entity id
     *
     * @param ids The collection of id (e.g. set, list) that in the wrapper used in domain level
     * @param target The target of the collection type (e.g. set, list)
     * @return The collection of id
     * @param <T> Type of the id
     * @param <C> Type of the collection (e.g. set, list)
     */
    public static <T, C extends Collection<T>> C toDbCollection(Collection<? extends Id<T>> ids, Supplier<C> target) {
        Objects.requireNonNull(target, "no target collection type provided");

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

    /**
     *
     * @param dbValue The entity id
     * @param factory The wrapper used to wrap the id
     * @return Wrapped id
     * @param <T> Type of the id
     * @param <D> Wrapped id use in domain level
     */
    public static <T, D extends Id<T>> D toDomainId(T dbValue, Function<T, D> factory) {
        Objects.requireNonNull(factory, "no result type factory provided");
        return dbValue == null ? null : (D) factory.apply(dbValue);
    }

    /**
     *
     * @param dbValues
     * @param factory
     * @param target
     * @return
     * @param <T>
     * @param <D>
     * @param <C>
     */
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

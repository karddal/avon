package uk.ac.bristol.cs.carc.db.domain.shared;

import lombok.Getter;

import java.util.Objects;

@Getter
public class Id<T> {
    private final T value;

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return String.valueOf(value);
    }

    @Override
    public boolean equals(Object object) {
        if (object == this) return  true;
        if (!(object instanceof Id<?>)) return false;
        return Objects.equals(value, ((Id<?>)object).value);
    }

    public boolean isEmpty() {
        return value == null;
    }

    public Id(final T value) {
        this.value = value;
    }
}

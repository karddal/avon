package uk.ac.bristol.cs.carc;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.modulith.core.ApplicationModules;

@SpringBootTest
class CarcApplicationTests {

    @Test
    void contextLoads() {}

    @Test
    void verifiesApplicationStructure() {
        var modules = ApplicationModules.of(CarcApplication.class);
        modules.verify();
    }
}

import ldap from 'ldapjs';

const server = ldap.createServer();

// In-memory user database
const users: Record<string, any> = {
    "uid=johndoe,ou=users,dc=example,dc=com": {
        dn: "uid=johndoe,ou=users,dc=example,dc=com",
        userPassword: "password123",
        displayName: "John Doe"
    },
    "uid=janedoe,ou=users,dc=example,dc=com": {
        dn: "uid=janedoe,ou=users,dc=example,dc=com",
        userPassword: "securepass",
        displayName: "Jane Doe"
    }
};

// Handle bind (authentication)
server.bind("dc=example,dc=com", (req: any, res: any, next: any) => {
    const user = users[req.dn.toString()];

    if (!user || req.credentials !== user.userPassword) {
        console.log("error")
        return next(new ldap.InvalidCredentialsError());
    }

    console.log(`User ${req.dn} authenticated successfully!`);
    res.end();
});

// Handle search requests
server.search("dc=example,dc=com", (req: any, res: any, next: any) => {
    console.log("OKOKOK")
    Object.values(users).forEach((user) => {
        if (user.dn.includes(req.filter.attribute) && user.dn.includes(req.filter.value)) {
            res.send({
                dn: user.dn,
                attributes: {
                    displayName: user.displayName
                }
            });
        }
    });

    res.end();
});

server.listen(3890, () => {
    console.log("LDAP server running on ldap://localhost:3890");
});



import React, { useEffect, useState } from "react";

const Message = () => {
    const [user, setUser] = useState(null); // État pour stocker les informations de l'utilisateur

    // Simulez la récupération des informations de l'utilisateur après une connexion réussie
    useEffect(() => {
        // Ici, vous pouvez récupérer les informations de l'utilisateur depuis le backend ou un état global (comme Redux ou Context)
        const fetchUser = async () => {
            try {
                // Exemple de récupération des données de l'utilisateur
                const response = await fetch("/api/auth/profile"); // Remplacez par votre endpoint
                const data = await response.json();

                if (data.success) {
                    setUser(data.user); // Mettez à jour l'état avec les informations de l'utilisateur
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUser();
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Connexion avec Facebook réussie !</h1>
            {user ? (
                <div>
                    <p>Bienvenue, {user.firstName} {user.lastName} !</p>
                    <p>Email: {user.email}</p>
                </div>
            ) : (
                <p>Chargement des informations de l'utilisateur...</p>
            )}
        </div>
    );
};

export default Message;
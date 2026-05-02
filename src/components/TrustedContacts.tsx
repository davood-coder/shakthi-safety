import { motion } from "framer-motion";
import { Mail, Phone, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const TrustedContacts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("Parent");

  const { data: contacts = [], isLoading, error: contactsError } = useQuery({
    queryKey: ["trusted_contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trusted_contacts")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addContact = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("trusted_contacts").insert({
        user_id: user!.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase() || null,
        relation,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted_contacts"] });
      setShowForm(false);
      setName("");
      setPhone("");
      setEmail("");
      setRelation("Parent");
      toast.success("Contact added!");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to add contact";
      toast.error(message);
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trusted_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted_contacts"] });
      toast.success("Contact removed");
    },
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground">Trusted Contacts</h2>
        {contacts.length < 5 && (
          <button
            onClick={() => setShowForm(true)}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-primary-foreground" />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        These contacts will be alerted instantly during an emergency with your live location.
      </p>

      {contactsError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {(contactsError as Error).message}
          <p className="mt-2">
            If this mentions <span className="font-semibold">trusted_contacts</span>, apply the Supabase migration in
            <span className="font-semibold"> supabase/migrations</span> to your project.
          </p>
        </div>
      )}

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(e) => { e.preventDefault(); addContact.mutate(); }}
          className="rounded-2xl bg-gradient-card border border-border p-4 space-y-3"
        >
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
          <input
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none"
          >
            <option value="Parent">Parent</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Partner">Partner</option>
            <option value="Other">Other</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={addContact.isPending}
              className="flex-1 py-2.5 rounded-xl bg-gradient-emergency text-primary-foreground font-display font-semibold text-sm disabled:opacity-50"
            >
              {addContact.isPending ? "Adding..." : "Add Contact"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-2xl bg-gradient-card border border-border p-4"
            >
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-display font-bold text-foreground">
                  {contact.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-semibold text-foreground">{contact.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {contact.phone}
                </p>
                {contact.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </p>
                )}
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground font-medium">
                {contact.relation}
              </span>
              <button
                onClick={() => deleteContact.mutate(contact.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {contacts.length === 0 && !isLoading && !showForm && (
        <div className="rounded-2xl border border-dashed border-border p-6 flex flex-col items-center gap-2">
          <UserPlus className="w-6 h-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center">Add up to 5 trusted contacts for emergency alerts</p>
        </div>
      )}
    </motion.div>
  );
};

export default TrustedContacts;

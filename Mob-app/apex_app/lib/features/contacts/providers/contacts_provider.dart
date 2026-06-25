import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/contact_model.dart';
import '../repositories/contacts_repository.dart';

final contactsRepositoryProvider =
    Provider<ContactsRepository>((_) => ContactsRepository());

final contactsSearchProvider = StateProvider<String>((_) => '');

final contactsListProvider =
    FutureProvider<List<ContactModel>>((ref) {
  final search = ref.watch(contactsSearchProvider);
  return ref.read(contactsRepositoryProvider).fetchContacts(search: search);
});
